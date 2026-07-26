import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { fetchSavingTransactionById, updateSavingTransactionStatusById } from "@/src/services/saving-transactions";

const ALLOWED_STATUSES = ["APPROVED", "REJECTED"];

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveRouteParams(params) {
  return Promise.resolve(params);
}

function normalizePayload(body) {
  return {
    status: typeof body?.status === "string" ? body.status.trim().toUpperCase() : "",
    admin_note: typeof body?.admin_note === "string" ? body.admin_note.trim() : "",
  };
}

export async function GET(request, { params }) {
  const authGuardError = assertAdminRequest(request);
  if (authGuardError) {
    return authGuardError;
  }

  const resolvedParams = await resolveRouteParams(params);
  if (!isUuid(resolvedParams?.id)) {
    return NextResponse.json({ error: "ID transaksi simpanan tidak valid." }, { status: 400 });
  }

  try {
    const saving_transaction = await fetchSavingTransactionById(resolvedParams.id);
    return NextResponse.json({ saving_transaction });
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
    return NextResponse.json({ error: "ID transaksi simpanan tidak valid." }, { status: 400 });
  }

  const body = await request.json();
  const payload = normalizePayload(body);

  if (!ALLOWED_STATUSES.includes(payload.status)) {
    return NextResponse.json({ error: "Status transaksi tidak valid." }, { status: 400 });
  }

  if (payload.status === "REJECTED" && !payload.admin_note) {
    return NextResponse.json({ error: "Alasan penolakan wajib diisi." }, { status: 400 });
  }

  try {
    const saving_transaction = await updateSavingTransactionStatusById(
      resolvedParams.id,
      payload.status,
      payload.admin_note || null
    );
    return NextResponse.json({ saving_transaction });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}