import { supabase } from "@/src/lib/supabase/client";

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function mapAuthUserToProfile(authUser) {
  if (!authUser) return null;

  return {
    id: authUser.id,
    email: authUser.email,
    display_name: authUser.user_metadata?.display_name || "",
    phone: authUser.user_metadata?.phone || "",
  };
}
