import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/client";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";

export async function GET(request) {
  const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;

  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client tidak tersedia." },
      { status: 500 }
    );
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: profile });
}
