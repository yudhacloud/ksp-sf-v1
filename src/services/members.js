import { supabaseAdmin } from "@/src/lib/supabase/client";

/**
 * Ambil seluruh data anggota dari tabel profiles.
 * Hanya ambil akun anggota biasa, tidak termasuk akun admin.
 * Fungsi ini digunakan oleh API route dan hanya berjalan di server.
 */
export async function fetchMembers() {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client tidak tersedia.");
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, member_number, full_name, email, phone, status, created_at, role")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
