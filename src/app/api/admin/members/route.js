import { NextResponse } from "next/server";
import { createMember, fetchMembers } from "@/src/services/members";
import { assertAdminRequest } from "@/src/lib/auth/server";

export async function GET(request) {
  const authGuardError = assertAdminRequest(request);
  if (authGuardError) {
    return authGuardError;
  }

  try {
    const members = await fetchMembers();
    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const authGuardError = assertAdminRequest(request);
  if (authGuardError) {
    return authGuardError;
  }

  const body = await request.json();
  const { full_name, email, phone, password, role } = body;

  if (!full_name || !email || !password) {
    return NextResponse.json(
      { error: "Nama, email, dan password wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const member = await createMember({
      full_name,
      email,
      phone,
      password,
      role,
    });

    return NextResponse.json({ member });
  } catch (error) {
    const status = error.message.includes("Supabase admin client") ? 500 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
