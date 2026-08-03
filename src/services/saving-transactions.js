import { supabaseAdmin } from "../lib/supabase/client";

export async function createSavingTransaction({ memberId, obligationId, amount, paymentDate, note, proofUrl }) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.")
   }

   const { data: obligationData, error: obligationError } = await supabaseAdmin
      .from("saving_obligations")
      .select("id, saving_account_id")
      .eq("id", obligationId)
      .single();

   if (obligationError || !obligationData) {
      throw new Error("Tagihan simpanan tidak ditemukan.")
   }

   const { data: accountData, error: accountError } = await supabaseAdmin
      .from("saving_accounts")
      .select("saving_product_id")
      .eq("id", obligationData.saving_account_id)
      .single();

   if (accountError || !accountData) {
      throw new Error("Akun simpanan tidak ditemukan.")
   }

   const { data, error } = await supabaseAdmin
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

export async function fetchSavingTransactions() {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.")
   }

   const { data, error } = await supabaseAdmin
      .from("saving_transactions")
      .select(`
         id,
         member_id,
         saving_product_id,
         amount,
         proof_url,
         status,
         admin_note,
         transaction_date,
         created_at,
         approved_by,
         approved_at,
         member:profiles!saving_transactions_member_id_fkey (
            id,
            member_number,
            full_name,
            email,
            phone,
            address,
            status,
            role
         ),
         saving_product:saving_products!saving_transactions_saving_product_id_fkey (
            id,
            name,
            saving_type
         )
      `)
      .order("created_at", { ascending: false })

   if (error) {
      throw new Error(error.message)
   }

   return data
}

export async function fetchSavingTransactionById(transactionId) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.")
   }

   const { data, error } = await supabaseAdmin
      .from("saving_transactions")
      .select(`
         id,
         member_id,
         saving_product_id,
         amount,
         proof_url,
         status,
         admin_note,
         transaction_date,
         created_at,
         approved_by,
         approved_at,
         member:profiles!saving_transactions_member_id_fkey (
            id,
            member_number,
            full_name,
            email,
            phone,
            address,
            status,
            role
         ),
         saving_product:saving_products!saving_transactions_saving_product_id_fkey (
            id,
            name,
            saving_type
         )
      `)
      .eq("id", transactionId)
      .single()

   if (error) {
      throw new Error(error.message)
   }

   return data
}

export async function updateSavingTransactionStatusById(transactionId, status, adminNote = null) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.")
   }

   const { data: currentTransaction, error: fetchError } = await supabaseAdmin
      .from("saving_transactions")
      .select("id, status")
      .eq("id", transactionId)
      .single()

   if (fetchError) {
      throw new Error(fetchError.message)
   }

   if (currentTransaction.status !== "PENDING") {
      throw new Error("Transaksi hanya bisa diubah saat status pending.")
   }

   const updates = {
      status,
      admin_note: status === "REJECTED" ? adminNote : currentTransaction.admin_note,
      approved_at: status === "APPROVED" ? new Date().toISOString() : null,
   }

   const { data, error } = await supabaseAdmin
      .from("saving_transactions")
      .update(updates)
      .eq("id", transactionId)
      .select(`
         id,
         member_id,
         saving_product_id,
         amount,
         proof_url,
         status,
         admin_note,
         transaction_date,
         created_at,
         approved_by,
         approved_at,
         member:profiles!saving_transactions_member_id_fkey (
            id,
            member_number,
            full_name,
            email,
            phone,
            address,
            status,
            role
         ),
         saving_product:saving_products!saving_transactions_saving_product_id_fkey (
            id,
            name,
            saving_type
         )
      `)
      .single()

   if (error) {
      throw new Error(error.message)
   }

   return data
}
