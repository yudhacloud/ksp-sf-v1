import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { deleteMemberById, fetchMemberById, updateMemberById } from "@/src/services/members";

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveRouteParams(params) {
  return Promise.resolve(params);
}

export async function GET(request, { params }) {
  const authGuardError = assertAdminRequest(request);
  if (authGuardError) {
    return authGuardError;
  }

  const resolvedParams = await resolveRouteParams(params);
  if (!isUuid(resolvedParams?.id)) {
    return NextResponse.json({ error: "ID anggota tidak valid." }, { status: 400 });
  }

  try {
    const member = await fetchMemberById(resolvedParams.id);
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

  const resolvedParams = await resolveRouteParams(params);
  if (!isUuid(resolvedParams?.id)) {
    return NextResponse.json({ error: "ID anggota tidak valid." }, { status: 400 });
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
    const member = await updateMemberById(resolvedParams.id, {
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

  const resolvedParams = await resolveRouteParams(params);
  if (!isUuid(resolvedParams?.id)) {
    return NextResponse.json({ error: "ID anggota tidak valid." }, { status: 400 });
  }

  try {
    await deleteMemberById(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}