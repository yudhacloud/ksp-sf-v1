import { supabaseAdmin } from "@/src/lib/supabase/client";

export async function fetchLoanProducts() {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client tidak tersedia.");
  }

  const { data, error } = await supabaseAdmin
    .from("loan_products")
    .select("id, name, max_amount, interest_rate, max_tenor, is_active")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createLoanProduct(payload) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client tidak tersedia.");
  }

  const { data, error } = await supabaseAdmin
    .from("loan_products")
    .insert([
      {
        name: payload.name,
        max_amount: payload.max_amount,
        interest_rate: payload.interest_rate,
        max_tenor: payload.max_tenor,
        is_active: payload.is_active,
      },
    ])
    .select("id, name, max_amount, interest_rate, max_tenor, is_active")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchLoanProductById(productId) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client tidak tersedia.");
  }

  const { data, error } = await supabaseAdmin
    .from("loan_products")
    .select("id, name, max_amount, interest_rate, max_tenor, is_active")
    .eq("id", productId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateLoanProductById(productId, payload) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client tidak tersedia.");
  }

  const { data, error } = await supabaseAdmin
    .from("loan_products")
    .update({
      name: payload.name,
      max_amount: payload.max_amount,
      interest_rate: payload.interest_rate,
      max_tenor: payload.max_tenor,
      is_active: payload.is_active,
    })
    .eq("id", productId)
    .select("id, name, max_amount, interest_rate, max_tenor, is_active")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}