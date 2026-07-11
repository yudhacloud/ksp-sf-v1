import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/src/lib/supabase/client";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/src/lib/auth/cookies";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json(
      { error: "User tidak ditemukan setelah login." },
      { status: 500 }
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client tidak tersedia." },
      { status: 500 }
    );
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const userRole = profile?.role || "pengguna";
  const response = NextResponse.json({ user: data.user, profile });

  if (data.session?.access_token) {
    response.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, data.session.access_token, COOKIE_OPTIONS);
    response.cookies.set(AUTH_COOKIE.ROLE, userRole, COOKIE_OPTIONS);
    response.cookies.set(AUTH_COOKIE.USER_ID, data.user.id, COOKIE_OPTIONS);
  }

  return response;
}
