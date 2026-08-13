import { supabase } from "@/src/lib/supabase/client";
import { createSupabaseServerClient } from "@/src/lib/supabase/server-client";

export async function fetchActiveLoanProductsForMembers(accessToken = null) {
   const client = accessToken ? createSupabaseServerClient(accessToken) : supabase;

   if (!client) {
      throw new Error("Supabase client pengguna tidak tersedia.");
   }

   const { data, error } = await client
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

      let loanDetail = null;
      let nextInstallment = null;

      if (application.status === "APPROVED") {
         const { data: loanData, error: loanError } = await client
            .from("loans")
            .select("id, principal_amount, remaining_balance, monthly_installment, start_date, end_date, status")
            .eq("application_id", application.id)
            .maybeSingle();

         if (!loanError && loanData?.id) {
            const { data: installments, error: installmentError } = await client
               .from("loan_installments")
               .select("id, installment_number, due_date, amount_due, status")
               .eq("loan_id", loanData.id)
               .order("installment_number", { ascending: true });

            const installmentIds = (installments || []).map((item) => item.id).filter(Boolean);
            let paymentRows = [];

            if (installmentIds.length > 0) {
               const { data: fetchedPayments, error: paymentError } = await client
                  .from("installment_payments")
                  .select("id, installment_id, amount, status, payment_date, proof_url, admin_note, created_at")
                  .in("installment_id", installmentIds)
                  .order("created_at", { ascending: false });

               if (!paymentError) {
                  paymentRows = fetchedPayments || [];
               }
            }

            const latestPaymentsByInstallment = new Map();
            paymentRows.forEach((payment) => {
               if (!payment?.installment_id || latestPaymentsByInstallment.has(payment.installment_id)) {
                  return;
               }

               latestPaymentsByInstallment.set(payment.installment_id, payment);
            });

            const installmentList = (installments || []).map((installment) => {
               const installmentPaymentRows = paymentRows
                  .filter((payment) => payment.installment_id === installment.id)
                  .sort((a, b) => new Date(b.created_at || b.payment_date || 0) - new Date(a.created_at || a.payment_date || 0));
               const latestPayment = installmentPaymentRows[0] || null;
               const paymentStatus = latestPayment?.status || null;
               const isPaymentLocked = paymentStatus === "PENDING" || paymentStatus === "APPROVED";

               return {
                  id: installment.id,
                  installment_number: installment.installment_number,
                  due_date: installment.due_date,
                  amount_due: Number(installment.amount_due || 0),
                  status: installment.status || "PENDING",
                  latest_payment_status: paymentStatus,
                  is_payment_locked: isPaymentLocked,
                  latest_payment_amount: Number(latestPayment?.amount || 0),
                  payment_date: latestPayment?.payment_date || null,
                  payment_history: installmentPaymentRows.map((payment) => ({
                     id: payment.id,
                     amount: Number(payment.amount || 0),
                     status: payment.status || "PENDING",
                     payment_date: payment.payment_date || null,
                     proof_url: payment.proof_url || null,
                     admin_note: payment.admin_note || null,
                     created_at: payment.created_at || null,
                  })),
               };
            });

            const amountPaid = installmentList
               .filter((installment) => installment.latest_payment_status === "APPROVED")
               .reduce((sum, installment) => sum + Number(installment.latest_payment_amount || 0), 0);

            const paymentHistory = installmentList
               .flatMap((installment) => (installment.payment_history || []).map((payment) => ({
                  ...payment,
                  installment_id: installment.id,
                  installment_number: installment.installment_number,
                  installment_label: `Cicilan ${installment.installment_number}`,
               })))
               .sort((a, b) => new Date(b.created_at || b.payment_date || 0) - new Date(a.created_at || a.payment_date || 0));

            const pendingInstallment = (installmentList || []).find((item) => item.status === "PENDING") || (installmentList || [])[0] || null;

            if (pendingInstallment) {
               nextInstallment = {
                  id: pendingInstallment.id,
                  installment_number: pendingInstallment.installment_number,
                  due_date: pendingInstallment.due_date,
                  amount_due: pendingInstallment.amount_due,
                  label: `Cicilan ${pendingInstallment.installment_number}`,
                  formatted_date: formatInstallmentDate(pendingInstallment.due_date),
                  latest_payment_status: pendingInstallment.latest_payment_status,
                  is_payment_locked: pendingInstallment.is_payment_locked,
               };
            }

            loanDetail = {
               id: loanData.id,
               principal_amount: Number(loanData.principal_amount || 0),
               remaining_balance: Number(loanData.remaining_balance || 0),
               monthly_installment: Number(loanData.monthly_installment || 0),
               start_date: loanData.start_date,
               end_date: loanData.end_date,
               status: loanData.status || "ACTIVE",
               active_installments: installmentList,
               total_paid: amountPaid,
               payment_history: paymentHistory,
            };
         }
      }

      return {
         ...application,
         loan_product_name: productRelation?.name || application.loan_product_name || "Pinjaman",
         loan_detail: loanDetail,
         next_installment: nextInstallment,
      };
   }));

   return applications;
}

export async function createLoanApplication({ memberId, loanProductId, amount, tenor, purpose, accessToken = null }) {
   const client = accessToken ? createSupabaseServerClient(accessToken) : supabase;

   if (!client) {
      throw new Error("Supabase client pengguna tidak tersedia.");
   }

   if (!memberId) {
      throw new Error("Member ID tidak tersedia.");
   }

   const { data: product, error: productError } = await client
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

   const parsedAmount = Number(amount);
   const parsedTenor = Number(tenor);
   const finalAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : Number(product.max_amount);
   const finalTenor = Number.isFinite(parsedTenor) && parsedTenor > 0 ? parsedTenor : Number(product.max_tenor);

   if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      throw new Error("Nominal pinjaman harus lebih besar dari 0.");
   }

   if (!Number.isFinite(finalTenor) || finalTenor <= 0) {
      throw new Error("Tenor pinjaman harus lebih besar dari 0.");
   }

   if (finalAmount > Number(product.max_amount)) {
      throw new Error("Nominal pinjaman melebihi batas maksimal produk.");
   }

   if (finalTenor > Number(product.max_tenor)) {
      throw new Error("Tenor pinjaman melebihi batas maksimal produk.");
   }

   const { data, error } = await client
      .from("loan_applications")
      .insert([
         {
            member_id: memberId,
            loan_product_id: loanProductId,
            amount: finalAmount,
            tenor: finalTenor,
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
