import { supabaseAdmin } from "../lib/supabase/client";

export async function fetchActiveSavingProducts() {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   const { data, error } = await supabaseAdmin
      .from("saving_products")
      .select("id, name, saving_type, description, is_active, created_at")
      .eq("is_active", true)
      .order("name", { ascending: true });

   if (error) {
      throw new Error(error.message);
   }

   return data;
}

export async function fetchSavingProducts() {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.")
   }

   const { data, error } = await supabaseAdmin
      .from("saving_products")
      .select("id, name, saving_type, description, is_active")
      .order("created_at", { ascending: false })

   if (error) {
      throw new Error(error.message)
   }

   return data
}

export async function createSavingProduct(payload) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.")
   }

   const { data, error } = await supabaseAdmin
      .from("saving_products")
      .insert([
         {
            name: payload.name,
            saving_type: payload.saving_type,
            description: payload.description,
            is_active: payload.is_active,
         },
      ])
      .select("id, name, saving_type, description, is_active")
      .single()

   if (error) {
      throw new Error(error.message)
   }

   return data
}

export async function fetchSavingProductById(productId) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.")
   }

   const { data, error } = await supabaseAdmin
      .from("saving_products")
      .select("id, name, saving_type, description, is_active, created_at")
      .eq("id", productId)
      .single()

   if (error) {
      throw new Error(error.message)
   }

   return data
}

export async function updateSavingProductById(productId, payload) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.")
   }

   const { data, error } = await supabaseAdmin
      .from("saving_products")
      .update({
         name: payload.name,
         saving_type: payload.saving_type,
         description: payload.description,
         is_active: payload.is_active,
      })
      .eq("id", productId)
      .select("id, name, saving_type, description, is_active")
      .single()

   if (error) {
      throw new Error(error.message)
   }

   return data
}