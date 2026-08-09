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

   return (data || []).map((installment) => ({
      id: installment.id,
      member_name: installment.loan?.member?.full_name || "Anggota",
      installment_label: `Cicilan ${installment.installment_number}`,
      due_date: installment.due_date,
      amount_due: Number(installment.amount_due || 0),
      status: installment.status || "PENDING",
   }));
}
