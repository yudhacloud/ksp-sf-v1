import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/client";

export async function POST(request) {
  const { userId, email, display_name, phone } = await request.json();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client tidak tersedia." },
      { status: 500 }
    );
  }

  if (!userId || !email || !display_name) {
    return NextResponse.json(
      { error: "userId, email, dan display_name wajib diisi." },
      { status: 400 }
    );
  }

  const memberNumber = `M-${userId.slice(0, 8).toUpperCase()}`;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .insert([
      {
        id: userId,
        member_number: memberNumber,
        full_name: display_name,
        email,
        phone,
      },
    ])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
