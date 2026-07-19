import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { deleteMemberById, fetchMemberById, updateMemberById } from "@/src/services/members";

export async function GET(request, { params }) {
  const authGuardError = assertAdminRequest(request);
  if (authGuardError) {
    return authGuardError;
  }

  try {
    const member = await fetchMemberById(params.id);
    return NextResponse.json({ member });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const authGuardError = assertAdminRequest(request);
  if (authGuardError) {
    return authGuardError;
  }

  const body = await request.json();
  const fullName = body.full_name?.trim();
  const phone = body.phone?.trim() || null;
  const role = body.role === "admin" ? "admin" : "pengguna";
  const status = Boolean(body.status);

  if (!fullName) {
    return NextResponse.json({ error: "Nama lengkap wajib diisi." }, { status: 400 });
  }

  try {
    const member = await updateMemberById(params.id, {
      full_name: fullName,
      phone,
      role,
      status,
    });

    return NextResponse.json({ member });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authGuardError = assertAdminRequest(request);
  if (authGuardError) {
    return authGuardError;
  }

  try {
    await deleteMemberById(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}