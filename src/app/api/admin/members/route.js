import { NextResponse } from "next/server";
import { createMember, fetchMembers } from "@/src/services/members";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { createAuditLog } from "@/src/services/audit-logs";

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
  const { full_name, email, phone, password } = body;
  const safePassword = password || "password123";

  if (!full_name || !email || !safePassword) {
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
      password: safePassword,
      role: "member",
    });

    const createdBy = request.cookies.get("user_id")?.value || null;
    await createAuditLog({
      actorId: createdBy,
      actorRole: "admin",
      action: "member_created",
      entityType: "profiles",
      entityId: member?.id || null,
      description: `Anggota baru ditambahkan: ${member?.full_name || full_name}.`,
      details: { email, phone, member_number: member?.member_number || null },
    });

    return NextResponse.json({ member });
  } catch (error) {
    const status = error.message.includes("Supabase admin client") ? 500 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
