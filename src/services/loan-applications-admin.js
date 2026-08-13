import { supabaseAdmin } from "@/src/lib/supabase/client";

function formatDateValue(date) {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
}

export async function fetchAllLoanApplications() {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   const { data, error } = await supabaseAdmin
      .from("loan_applications")
      .select(`
      id,
      amount,
      tenor,
      purpose,
      status,
      admin_note,
      reviewed_at,
      created_at,
      member_id,
      loan_product_id,
      member:profiles!loan_applications_member_id_fkey (
        id,
        full_name,
        member_number,
        email
      ),
      loan_products!loan_applications_loan_product_id_fkey (
        id,
        name,
        interest_rate
      )
    `)
      .order("created_at", { ascending: false });

   if (error) {
      throw new Error(error.message);
   }

   return (data || []).map((application) => {
      const productRelation = Array.isArray(application.loan_products)
         ? application.loan_products[0]
         : application.loan_products;

      return {
         ...application,
         loan_product_name: productRelation?.name || "Pinjaman",
         member_name: application.member?.full_name || "Anggota",
      };
   });
}

export async function updateLoanApplicationStatusById(applicationId, status, adminNote = null, reviewedBy = null) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   const { data: currentApplication, error: fetchError } = await supabaseAdmin
      .from("loan_applications")
      .select("id, status")
      .eq("id", applicationId)
      .single();

   if (fetchError) {
      throw new Error(fetchError.message);
   }

   if (currentApplication.status !== "PENDING") {
      throw new Error("Pengajuan hanya bisa diubah saat status pending.");
   }

   const updates = {
      status,
      admin_note: status === "REJECTED" ? adminNote : currentApplication.admin_note,
      reviewed_at: status === "APPROVED" || status === "REJECTED" ? new Date().toISOString() : null,
      reviewed_by: status === "APPROVED" || status === "REJECTED" ? reviewedBy || null : null,
   };

   const { data, error } = await supabaseAdmin
      .from("loan_applications")
      .update(updates)
      .eq("id", applicationId)
      .select(`
      id,
      amount,
      tenor,
      purpose,
      status,
      admin_note,
      reviewed_at,
      created_at,
      member_id,
      loan_product_id,
      member:profiles!loan_applications_member_id_fkey (
        id,
        full_name,
        member_number,
        email
      ),
      loan_products!loan_applications_loan_product_id_fkey (
        id,
        name,
        interest_rate
      )
    `)
      .single();

   if (error) {
      throw new Error(error.message);
   }

   if (status === "APPROVED") {
      const { data: existingLoan, error: existingLoanError } = await supabaseAdmin
         .from("loans")
         .select("id")
         .eq("application_id", applicationId)
         .maybeSingle();

      if (existingLoanError) {
         throw new Error(existingLoanError.message);
      }

      if (!existingLoan) {
         const productRelation = Array.isArray(data.loan_products)
            ? data.loan_products[0]
            : data.loan_products;

         const principalAmount = Number(data.amount || 0);
         const tenorMonths = Number(data.tenor || 0);
         const interestRate = Number(productRelation?.interest_rate || 0);
         const totalWithInterest = principalAmount * (1 + (interestRate / 100));
         const monthlyInstallment = tenorMonths > 0
            ? Number((totalWithInterest / tenorMonths).toFixed(2))
            : principalAmount;

         const startDate = new Date();
         const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + tenorMonths, startDate.getDate());

         const { data: createdLoan, error: createLoanError } = await supabaseAdmin
            .from("loans")
            .insert([{
               application_id: applicationId,
               member_id: data.member_id,
               principal_amount: principalAmount,
               interest_rate: interestRate,
               tenor: tenorMonths,
               monthly_installment: monthlyInstallment,
               remaining_balance: totalWithInterest,
               start_date: formatDateValue(startDate),
               end_date: formatDateValue(endDate),
               status: "ACTIVE",
            }])
            .select("id")
            .single();

         if (createLoanError) {
            throw new Error(createLoanError.message);
         }

         if (createdLoan?.id && tenorMonths > 0) {
            const installments = Array.from({ length: tenorMonths }, (_, index) => ({
               loan_id: createdLoan.id,
               installment_number: index + 1,
               due_date: formatDateValue(new Date(startDate.getFullYear(), startDate.getMonth() + index, startDate.getDate())),
               amount_due: monthlyInstallment,
               status: "PENDING",
            }));

            const { error: createInstallmentsError } = await supabaseAdmin
               .from("loan_installments")
               .insert(installments);

            if (createInstallmentsError) {
               throw new Error(createInstallmentsError.message);
            }
         }
      }
   }

   return {
      ...data,
      loan_product_name: data.loan_products?.name || "Pinjaman",
      member_name: data.member?.full_name || "Anggota",
   };
}
