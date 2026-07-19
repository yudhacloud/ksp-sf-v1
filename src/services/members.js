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

export async function fetchMemberById(memberId) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client tidak tersedia.");
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, member_number, full_name, email, phone, role, status, created_at, updated_at")
    .eq("id", memberId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateMemberById(memberId, updates) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client tidak tersedia.");
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: updates.full_name,
      phone: updates.phone,
      role: updates.role,
      status: updates.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .select("id, member_number, full_name, email, phone, role, status, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteMemberById(memberId) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client tidak tersedia.");
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(memberId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
