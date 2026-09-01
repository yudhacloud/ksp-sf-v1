import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/client";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";

export async function PATCH(request) {
  const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client tidak tersedia." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { full_name, phone, address } = body;

    if (!full_name || !phone || !address) {
      return NextResponse.json(
        { error: "Nama, telepon, dan alamat wajib diisi." },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: full_name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
