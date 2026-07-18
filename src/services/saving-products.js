import { supabaseAdmin } from "../lib/supabase/client";

export async function fetchSavingProducts() {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.")
   }

   const {data, error} = await supabaseAdmin
   .from("saving_products")
   .select("id, name, saving_type, description, is_active")
   .order("created_at", {ascending: false})

   if (error) {
      throw new Error(error.message)
   }

   return data
}