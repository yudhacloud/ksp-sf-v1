import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/src/lib/supabase/client";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/src/lib/auth/cookies";

export async function POST(request) {
  const { email, password, displayName, phone, role } = await request.json();

  if (!email || !password || !displayName) {
    return NextResponse.json(
      { error: "Email, password, dan displayName wajib diisi." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        phone,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const user = data.user;

  if (!user) {
    return NextResponse.json(
      { error: "User tidak ditemukan setelah proses registrasi." },
      { status: 500 }
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client tidak tersedia." },
      { status: 500 }
    );
  }

  const memberNumber = `M-${user.id.slice(0, 8).toUpperCase()}`;
  const userRole = role || "pengguna";

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert([
      {
        id: user.id,
        member_number: memberNumber,
        full_name: displayName,
        email,
        phone,
        role: userRole,
      },
    ])
    .select("*")
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const response = NextResponse.json({ user, profile });

  if (data.session?.access_token) {
    response.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, data.session.access_token, COOKIE_OPTIONS);
    response.cookies.set(AUTH_COOKIE.ROLE, userRole, COOKIE_OPTIONS);
    response.cookies.set(AUTH_COOKIE.USER_ID, user.id, COOKIE_OPTIONS);
  }

  return response;
}
