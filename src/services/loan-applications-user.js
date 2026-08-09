import { supabaseAdmin } from "@/src/lib/supabase/client";

export async function fetchActiveLoanProductsForMembers() {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   const { data, error } = await supabaseAdmin
      .from("loan_products")
      .select("id, name, max_amount, interest_rate, max_tenor")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

   if (error) {
      throw new Error(error.message);
   }

   return data || [];
}

export async function fetchMemberLoanApplications(memberId) {
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

   return (data || []).map((application) => {
      const productRelation = Array.isArray(application.loan_products)
         ? application.loan_products[0]
         : application.loan_products;

      return {
         ...application,
         loan_product_name: productRelation?.name || application.loan_product_name || "Pinjaman",
      };
   });
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
            name
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
            name
         )
      `)
      .single();

   if (error) {
      throw new Error(error.message);
   }

   return {
      ...data,
      loan_product_name: data.loan_products?.name || "Pinjaman",
      member_name: data.member?.full_name || "Anggota",
   };
}

export async function createLoanApplication({ memberId, loanProductId, amount, tenor, purpose }) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
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

   const { data: product, error: productError } = await supabaseAdmin
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

   const { data, error } = await supabaseAdmin
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
