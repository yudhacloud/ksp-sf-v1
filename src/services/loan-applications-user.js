import { supabase } from "@/src/lib/supabase/client";
import { createSupabaseServerClient } from "@/src/lib/supabase/server-client";

export async function fetchActiveLoanProductsForMembers() {
   if (!supabase) {
      throw new Error("Supabase client pengguna tidak tersedia.");
   }

   const { data, error } = await supabase
      .from("loan_products")
      .select("id, name, max_amount, interest_rate, max_tenor")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

   if (error) {
      throw new Error(error.message);
   }

   return data || [];
}

function formatInstallmentDate(value) {
   if (!value) {
      return "";
   }

   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) {
      return value;
   }

   return parsed.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
   });
}

export async function fetchMemberLoanApplications(memberId, accessToken = null) {
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

   const { data, error } = await client
      .from("loan_applications")
      .select(`
         id,
         amount,
         tenor,
         purpose,
         status,
         created_at,
         loan_product_id,
         loan_products!loan_applications_loan_product_id_fkey (
            id,
            name
         )
      `)
      .eq("member_id", memberId)
      .order("created_at", { ascending: false });

   if (error) {
      throw new Error(error.message);
   }

   const applications = await Promise.all((data || []).map(async (application) => {
      const productRelation = Array.isArray(application.loan_products)
         ? application.loan_products[0]
         : application.loan_products;

      let nextInstallment = null;

      if (application.status === "APPROVED") {
         const { data: loanData, error: loanError } = await client
            .from("loans")
            .select("id")
            .eq("application_id", application.id)
            .maybeSingle();

         if (!loanError && loanData?.id) {
            const { data: installments, error: installmentError } = await client
               .from("loan_installments")
               .select("id, installment_number, due_date, amount_due, status")
               .eq("loan_id", loanData.id)
               .order("installment_number", { ascending: true });

            if (!installmentError) {
               const pendingInstallment = (installments || []).find((item) => item.status === "PENDING") || (installments || [])[0] || null;

               if (pendingInstallment) {
                  let latestPaymentStatus = null;

                  const { data: latestPayment, error: latestPaymentError } = await client
                     .from("installment_payments")
                     .select("status, created_at")
                     .eq("installment_id", pendingInstallment.id)
                     .order("created_at", { ascending: false })
                     .limit(1)
                     .maybeSingle();

                  if (!latestPaymentError && latestPayment?.status) {
                     latestPaymentStatus = latestPayment.status;
                  }

                  const isPaymentLocked = latestPaymentStatus === "PENDING" || latestPaymentStatus === "APPROVED";

                  nextInstallment = {
                     id: pendingInstallment.id,
                     installment_number: pendingInstallment.installment_number,
                     due_date: pendingInstallment.due_date,
                     amount_due: pendingInstallment.amount_due,
                     label: `Cicilan ${pendingInstallment.installment_number}`,
                     formatted_date: formatInstallmentDate(pendingInstallment.due_date),
                     latest_payment_status: latestPaymentStatus,
                     is_payment_locked: isPaymentLocked,
                  };
               }
            }
         }
      }

      return {
         ...application,
         loan_product_name: productRelation?.name || application.loan_product_name || "Pinjaman",
         next_installment: nextInstallment,
      };
   }));

   return applications;
}

export async function createLoanApplication({ memberId, loanProductId, amount, tenor, purpose }) {
   if (!supabase) {
      throw new Error("Supabase client pengguna tidak tersedia.");
   }

   if (!memberId) {
      throw new Error("Member ID tidak tersedia.");
   }

   const parsedAmount = Number(amount);
   const parsedTenor = Number(tenor);

   if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Nominal pinjaman harus lebih besar dari 0.");
   }

   if (!Number.isFinite(parsedTenor) || parsedTenor <= 0) {
      throw new Error("Tenor pinjaman harus lebih besar dari 0.");
   }

   const { data: product, error: productError } = await supabase
      .from("loan_products")
      .select("id, name, max_amount, max_tenor, is_active")
      .eq("id", loanProductId)
      .eq("is_active", true)
      .maybeSingle();

   if (productError) {
      throw new Error(productError.message);
   }

   if (!product) {
      throw new Error("Produk pinjaman tidak ditemukan atau tidak aktif.");
   }

   if (parsedAmount > Number(product.max_amount)) {
      throw new Error("Nominal pinjaman melebihi batas maksimal produk.");
   }

   if (parsedTenor > Number(product.max_tenor)) {
      throw new Error("Tenor pinjaman melebihi batas maksimal produk.");
   }

   const { data, error } = await supabase
      .from("loan_applications")
      .insert([
         {
            member_id: memberId,
            loan_product_id: loanProductId,
            amount: parsedAmount,
            tenor: parsedTenor,
            purpose: typeof purpose === "string" ? purpose.trim() : "",
            status: "PENDING",
         },
      ])
      .select("id, member_id, loan_product_id, amount, tenor, purpose, status, created_at")
      .single();

   if (error) {
      throw new Error(error.message);
   }

   return data;
}
