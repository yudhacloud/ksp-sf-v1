import { createSupabaseServerClient } from "../lib/supabase/server-client";
import { ensureMemberObligationsForCurrentMonth } from "./saving-accounts-user";

export async function fetchSavingOverviewForMember({ accessToken, memberId }) {
   if (!accessToken) {
      throw new Error("Access token tidak tersedia.");
   }

   const supabase = createSupabaseServerClient(accessToken);

   await ensureMemberObligationsForCurrentMonth({ memberId });

   const { data: accounts, error: accountsError } = await supabase
      .from("saving_accounts")
      .select(`
         id,
         start_date,
         status,
         saving_product:saving_products!saving_accounts_saving_product_id_fkey (
            id,
            name,
            saving_type
         )
      `)
      .eq("member_id", memberId)
      .eq("status", "ACTIVE");

   if (accountsError) {
      throw new Error(accountsError.message);
   }

   const accountIds = (accounts || []).map((account) => account.id);

   const [{ data: obligations, error: obligationsError }, { data: transactions, error: transactionsError }] = await Promise.all([
      supabase
         .from("saving_obligations")
         .select(`
            id,
            billing_period,
            due_date,
            amount_due,
            status,
            saving_account_id,
            saving_account:saving_accounts!saving_obligations_saving_account_id_fkey (
               saving_product:saving_products!saving_accounts_saving_product_id_fkey (
                  id,
                  name,
                  saving_type
               )
            )
         `)
         .in("saving_account_id", accountIds.length ? accountIds : ["00000000-0000-0000-0000-000000000000"])
         .order("due_date", { ascending: true }),
      supabase
         .from("saving_transactions")
         .select(`
            id,
            amount,
            status,
            admin_note,
            transaction_date,
            created_at,
            saving_obligation_id,
            saving_product_id
         `)
         .eq("member_id", memberId)
         .order("created_at", { ascending: false }),
   ]);

   if (obligationsError) {
      throw new Error(obligationsError.message);
   }

   if (transactionsError) {
      throw new Error(transactionsError.message);
   }

   const totalBalance = (transactions || []).filter((item) => item.status === "APPROVED").reduce((sum, item) => sum + Number(item.amount || 0), 0);
   const ongoingObligations = (obligations || []).filter((item) => item.status !== "PAID");
   const pendingObligations = ongoingObligations.filter((item) => item.status === "PENDING" || item.status === "OVERDUE").length;

   const obligationSummaries = (obligations || []).map((obligation) => {
      const paidAmount = (transactions || []).filter((transaction) => transaction.saving_obligation_id === obligation.id && transaction.status === "APPROVED").reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
      const remainingAmount = Math.max(Number(obligation.amount_due || 0) - paidAmount, 0);
      const productType = obligation.saving_account?.saving_product?.saving_type;
      const productName = obligation.saving_account?.saving_product?.name || "Simpanan";
      return {
         id: obligation.id,
         period: obligation.billing_period,
         dueDate: obligation.due_date,
         amountDue: Number(obligation.amount_due || 0),
         paidAmount,
         remainingAmount,
         status: remainingAmount <= 0 ? "Lunas" : obligation.status === "PARTIAL" ? "Sebagian" : "Belum Lunas",
         kind: productType || "WAJIB",
         label: productType === "POKOK" ? "Simpanan Pokok" : productType === "WAJIB" ? "Simpanan Wajib" : productName,
      };
   });

   return {
      balance: totalBalance,
      mandatorySavings: totalBalance,
      voluntarySavings: 0,
      pendingObligations: pendingObligations,
      obligations: obligationSummaries,
      transactions: (transactions || []).map((transaction) => ({
         id: transaction.id,
         title: transaction.admin_note || "Pembayaran simpanan",
         amount: Number(transaction.amount || 0),
         date: transaction.transaction_date || transaction.created_at,
         status: transaction.status,
         kind: transaction.saving_obligation_id ? "WAJIB" : "SUKARELA",
      })),
      accounts: (accounts || []).map((account) => ({
         id: account.id,
         name: account.saving_product?.name || "Simpanan",
         type: account.saving_product?.saving_type || "WAJIB",
      })),
   };
}
