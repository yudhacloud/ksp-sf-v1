import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/client";
import { fetchMembers } from "@/src/services/members";

export async function GET() {
  try {
    const members = await fetchMembers();
    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  const { full_name, email, phone, password, role } = body;

  if (!full_name || !email || !password) {
    return NextResponse.json(
      { error: "Nama, email, dan password wajib diisi." },
      { status: 400 }
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client tidak tersedia." },
      { status: 500 }
    );
  }

  const normalizedRole = role === "admin" ? "admin" : "pengguna";
  const memberNumber = `M-${email.split("@")[0]}-${Date.now().toString().slice(-5)}`;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      full_name,
      phone,
    },
    email_confirm: true,
    role: normalizedRole,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Gagal memperoleh ID pengguna setelah pembuatan auth." },
      { status: 500 }
    );
  }

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert([
      {
        id: userId,
        member_number: memberNumber,
        full_name,
        email,
        phone,
        role: normalizedRole,
        status: true,
      },
    ])
    .select("*")
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ member: profileData });
}
