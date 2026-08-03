import { createSupabaseServerClient } from "../lib/supabase/server-client";

export async function createSavingTransaction({ accessToken, memberId, obligationId, amount, paymentDate, note, proofUrl }) {
   if (!accessToken) {
      throw new Error("Access token tidak tersedia.");
   }

   const supabase = createSupabaseServerClient(accessToken);

   const { data: obligationData, error: obligationError } = await supabase
      .from("saving_obligations")
      .select("id, saving_account_id")
      .eq("id", obligationId)
      .single();

   if (obligationError || !obligationData) {
      throw new Error("Tagihan simpanan tidak ditemukan.");
   }

   const { data: accountData, error: accountError } = await supabase
      .from("saving_accounts")
      .select("saving_product_id")
      .eq("id", obligationData.saving_account_id)
      .single();

   if (accountError || !accountData) {
      throw new Error("Akun simpanan tidak ditemukan.");
   }

   const { data, error } = await supabase
      .from("saving_transactions")
      .insert([
         {
            member_id: memberId,
            saving_product_id: accountData.saving_product_id,
            saving_obligation_id: obligationId,
            amount,
            transaction_date: paymentDate || new Date().toISOString().slice(0, 10),
            status: "PENDING",
            proof_url: proofUrl || null,
            admin_note: note || null,
         },
      ])
      .select(`
         id,
         member_id,
         saving_product_id,
         amount,
         proof_url,
         status,
         admin_note,
         transaction_date,
         created_at
      `)
      .single();

   if (error) {
      throw new Error(error.message);
   }

   return data;
}
