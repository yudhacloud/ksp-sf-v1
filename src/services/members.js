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

export async function createMember(payload) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client tidak tersedia.");
  }

  const normalizedRole = payload.role === "admin" ? "admin" : "pengguna";
  const memberNumber = `M-${payload.email.split("@")[0]}-${Date.now().toString().slice(-5)}`;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    user_metadata: {
      full_name: payload.full_name,
      phone: payload.phone,
    },
    email_confirm: true,
    role: normalizedRole,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error("Gagal memperoleh ID pengguna setelah pembuatan auth.");
  }

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert([
      {
        id: userId,
        member_number: memberNumber,
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        role: normalizedRole,
        status: true,
      },
    ])
    .select("id, member_number, full_name, email, phone, status, created_at, role")
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return profileData;
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
