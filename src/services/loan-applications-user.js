import { supabase } from "@/src/lib/supabase/client";

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

export async function fetchMemberLoanApplications(memberId) {
   if (!supabase) {
      throw new Error("Supabase client pengguna tidak tersedia.");
   }

   const { data, error } = await supabase
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
