import { supabaseAdmin } from "@/src/lib/supabase/client";

export async function fetchAdminLoans() {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   const { data, error } = await supabaseAdmin
      .from("loans")
      .select(`
      id,
      principal_amount,
      remaining_balance,
      tenor,
      status,
      created_at,
      member:profiles!loans_member_id_fkey (
        id,
        full_name,
        member_number
      ),
      application:loan_applications!loans_application_id_fkey (
        id,
        loan_product_id,
        loan_products!loan_applications_loan_product_id_fkey (
          id,
          name
        )
      )
    `)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false });

   if (error) {
      throw new Error(error.message);
   }

   return (data || []).map((loan) => ({
      id: loan.id,
      member_name: loan.member?.full_name || "Anggota",
      product_name: loan.application?.loan_products?.name || "Pinjaman",
      principal: Number(loan.principal_amount || 0),
      remaining: Number(loan.remaining_balance || 0),
      tenor: loan.tenor,
      status: loan.status || "ACTIVE",
   }));
}

export async function fetchAdminInstallments() {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   const { data, error } = await supabaseAdmin
      .from("loan_installments")
      .select(`
      id,
      installment_number,
      due_date,
      amount_due,
      status,
      loan:loans!loan_installments_loan_id_fkey (
        id,
        member_id,
        member:profiles!loans_member_id_fkey (
          id,
          full_name,
          member_number
        )
      )
    `)
      .order("due_date", { ascending: true });

   if (error) {
      throw new Error(error.message);
   }

   const installments = data || [];
   const installmentIds = installments.map((installment) => installment.id).filter(Boolean);

   let payments = [];
   if (installmentIds.length > 0) {
      const { data: paymentRows, error: paymentError } = await supabaseAdmin
         .from("installment_payments")
         .select("id, installment_id, amount, payment_date, proof_url, status, admin_note, created_at")
         .in("installment_id", installmentIds)
         .order("created_at", { ascending: false });

      if (paymentError) {
         throw new Error(paymentError.message);
      }

      payments = paymentRows || [];
   }

   const latestPaymentsByInstallment = new Map();
   payments.forEach((payment) => {
      if (!payment?.installment_id || latestPaymentsByInstallment.has(payment.installment_id)) {
         return;
      }

      latestPaymentsByInstallment.set(payment.installment_id, payment);
   });

   return installments.map((installment) => {
      const payment = latestPaymentsByInstallment.get(installment.id) || null;

      return {
         id: installment.id,
         member_id: installment.loan?.member?.id || installment.loan?.member_id || null,
         member_name: installment.loan?.member?.full_name || "Anggota",
         installment_label: `Cicilan ${installment.installment_number}`,
         due_date: installment.due_date,
         amount_due: Number(installment.amount_due || 0),
         status: installment.status || "PENDING",
         payment_id: payment?.id || null,
         latest_payment_status: payment?.status || null,
         latest_payment_amount: Number(payment?.amount || 0),
         latest_payment_date: payment?.payment_date || null,
         latest_payment_proof_url: payment?.proof_url || null,
         latest_payment_admin_note: payment?.admin_note || null,
      };
   });
}

export async function updateInstallmentPaymentStatusById(paymentId, status, adminNote = null) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   const { data: payment, error: paymentFetchError } = await supabaseAdmin
      .from("installment_payments")
      .select("id, installment_id, status, admin_note")
      .eq("id", paymentId)
      .single();

   if (paymentFetchError || !payment) {
      throw new Error("Data pembayaran cicilan tidak ditemukan.");
   }

   if (payment.status !== "PENDING") {
      throw new Error("Pembayaran hanya bisa diubah saat status pending.");
   }

   const { error: updatePaymentError } = await supabaseAdmin
      .from("installment_payments")
      .update({
         status,
         admin_note: status === "REJECTED" ? adminNote : payment.admin_note,
      })
      .eq("id", paymentId);

   if (updatePaymentError) {
      throw new Error(updatePaymentError.message);
   }

   const { error: updateInstallmentError } = await supabaseAdmin
      .from("loan_installments")
      .update({
         status: status === "APPROVED" ? "PAID" : "PENDING",
      })
      .eq("id", payment.installment_id);

   if (updateInstallmentError) {
      throw new Error(updateInstallmentError.message);
   }

   return {
      id: paymentId,
      status,
   };
}
