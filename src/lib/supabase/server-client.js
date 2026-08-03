import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createSupabaseServerClient(accessToken) {
   if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
   }

   if (!accessToken) {
      throw new Error("Access token tidak tersedia.");
   }

   return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
         persistSession: false,
         autoRefreshToken: false,
      },
      global: {
         headers: {
            Authorization: `Bearer ${accessToken}`,
         },
      },
   });
}
