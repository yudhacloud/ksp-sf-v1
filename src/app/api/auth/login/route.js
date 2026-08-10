import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/src/lib/supabase/client";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/src/lib/auth/cookies";
import { createSupabaseServerClient } from "@/src/lib/supabase/server-client";

export async function POST(request) {
  const { email, password } = await request.json();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "");

  if (!normalizedEmail || !normalizedPassword) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: normalizedPassword,
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

  let profile = null;

  if (supabaseAdmin) {
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!profileError && adminProfile) {
      profile = adminProfile;
    }
  }

  if (!profile && data.session?.access_token) {
    try {
      const scopedClient = createSupabaseServerClient(data.session.access_token);
      const { data: scopedProfile, error: scopedProfileError } = await scopedClient
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (!scopedProfileError && scopedProfile) {
        profile = scopedProfile;
      }
    } catch {
      // keep fallback profile below
    }
  }

  if (!profile) {
    profile = {
      id: data.user.id,
      email: data.user.email,
      role: "member",
    };
  }

  const userRole = profile.role || "member";
  const response = NextResponse.json({ user: data.user, profile });

  if (data.session?.access_token) {
    response.cookies.set(AUTH_COOKIE.ACCESS_TOKEN, data.session.access_token, COOKIE_OPTIONS);
    response.cookies.set(AUTH_COOKIE.ROLE, userRole, COOKIE_OPTIONS);
    response.cookies.set(AUTH_COOKIE.USER_ID, data.user.id, COOKIE_OPTIONS);
  }

  return response;
}
