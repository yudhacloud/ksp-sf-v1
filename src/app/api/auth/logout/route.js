import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase/client";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/src/lib/auth/cookies";

export async function POST() {
  await supabase.auth.signOut();

  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE.ACCESS_TOKEN, COOKIE_OPTIONS);
  response.cookies.delete(AUTH_COOKIE.ROLE, COOKIE_OPTIONS);
  response.cookies.delete(AUTH_COOKIE.USER_ID, COOKIE_OPTIONS);

  return response;
}
