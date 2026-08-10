import { supabase } from "@/src/lib/supabase/client";
import { createSupabaseServerClient } from "@/src/lib/supabase/server-client";

export async function createInstallmentPayment({ memberId, installmentId, amount, paymentDate, note, proofUrl, accessToken = null }) {
   let client = supabase;

   if (accessToken) {
      try {
         client = createSupabaseServerClient(accessToken);
      } catch {
         client = supabase;
      }
   }

   if (!client) {
      throw new Error("Supabase client pengguna tidak tersedia.");
   }

   if (!memberId) {
      throw new Error("Member ID tidak tersedia.");
   }

   if (!installmentId) {
      throw new Error("ID cicilan tidak tersedia.");
   }

   const parsedAmount = Number(amount);
   if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Nominal pembayaran harus lebih besar dari 0.");
   }

   const { data: installment, error: installmentError } = await client
      .from("loan_installments")
      .select("id, loan_id, amount_due, status")
      .eq("id", installmentId)
      .single();

   if (installmentError || !installment) {
      throw new Error("Data cicilan tidak ditemukan.");
   }

   const { data: loan, error: loanError } = await client
      .from("loans")
      .select("id, member_id")
      .eq("id", installment.loan_id)
      .single();

   if (loanError || !loan) {
      throw new Error("Data pinjaman tidak ditemukan.");
   }

   if (loan.member_id !== memberId) {
      throw new Error("Anda tidak berhak mengirim pembayaran untuk cicilan ini.");
   }

   const { data, error } = await client
      .from("installment_payments")
      .insert([
         {
            installment_id: installmentId,
            amount: parsedAmount,
            payment_date: paymentDate || new Date().toISOString().slice(0, 10),
            proof_url: proofUrl || null,
            status: "PENDING",
            admin_note: note || null,
         },
      ])
      .select("id, installment_id, amount, payment_date, proof_url, status, admin_note, created_at")
      .single();

   if (error) {
      throw new Error(error.message);
   }

   return data;
}
