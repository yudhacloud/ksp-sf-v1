import { supabaseAdmin } from "../lib/supabase/client";

function getMonthStart(dateValue) {
   if (!dateValue) {
      return null;
   }

   const parsed = new Date(dateValue);
   if (Number.isNaN(parsed.getTime())) {
      return null;
   }

   const monthStart = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
   return monthStart.toISOString().slice(0, 10);
}

function normalizeMonitoringStatus(status) {
   const normalized = String(status || "").toUpperCase();
   if (normalized === "PAID") return "PAID";
   if (normalized === "PARTIAL") return "PARTIAL";
   if (normalized === "OVERDUE") return "OVERDUE";
   return "PENDING";
}

export async function fetchSavingMonitoring() {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.")
   }

   const { data, error } = await supabaseAdmin
      .from("saving_obligations")
      .select(`
         id,
         billing_period,
         due_date,
         amount_due,
         status,
         saving_account:saving_accounts!saving_obligations_saving_account_id_fkey (
            id,
            start_date,
            member:profiles!saving_accounts_member_id_fkey (
               id,
               member_number,
               full_name,
               email
            ),
            saving_product:saving_products!saving_accounts_saving_product_id_fkey (
               id,
               name,
               saving_type
            )
         ),
         saving_transactions:saving_transactions!saving_transactions_saving_obligation_id_fkey (
            id,
            amount,
            status
         )
      `)
      .order("billing_period", { ascending: false })

   if (error) {
      throw new Error(error.message)
   }

   const normalized = (data || [])
      .map((item) => {
         const account = item.saving_account;
         const member = account?.member;
         const product = account?.saving_product;

         if (!account || !member || !product) {
            return null;
         }

         const periodStart = getMonthStart(account.start_date);
         if (periodStart && item.billing_period < periodStart) {
            return null;
         }

         const approvedAmount = (item.saving_transactions || [])
            .filter((transaction) => String(transaction.status || "").toUpperCase() === "APPROVED")
            .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

         const remainingAmount = Math.max(Number(item.amount_due || 0) - approvedAmount, 0);
         const calculatedStatus = normalizeMonitoringStatus(
            approvedAmount >= Number(item.amount_due || 0)
               ? "PAID"
               : remainingAmount > 0 && String(item.status || "").toUpperCase() === "OVERDUE"
                  ? "OVERDUE"
                  : approvedAmount > 0
                     ? "PARTIAL"
                     : "PENDING"
         );

         return {
            obligation_id: item.id,
            billing_period: item.billing_period,
            due_date: item.due_date,
            amount_due: item.amount_due,
            obligation_status: item.status,
            saving_account_id: account.id,
            account_status: "ACTIVE",
            member_id: member.id,
            member_number: member.member_number,
            full_name: member.full_name,
            email: member.email,
            saving_product_id: product.id,
            saving_product_name: product.name,
            saving_type: product.saving_type,
            approved_amount: approvedAmount,
            remaining_amount: remainingAmount,
            calculated_status: calculatedStatus,
            approved_payment_count: (item.saving_transactions || []).filter((transaction) => String(transaction.status || "").toUpperCase() === "APPROVED").length,
         };
      })
      .filter(Boolean)
      .sort((a, b) => {
         if (a.billing_period === b.billing_period) {
            return a.full_name.localeCompare(b.full_name);
         }
         return a.billing_period < b.billing_period ? 1 : -1;
      });

   return normalized
}
