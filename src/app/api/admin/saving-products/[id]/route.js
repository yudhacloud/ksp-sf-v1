import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { fetchSavingProductById, updateSavingProductById } from "@/src/services/saving-products";

const ALLOWED_SAVING_TYPES = ["POKOK", "WAJIB", "SUKARELA"];

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveRouteParams(params) {
  return Promise.resolve(params);
}

function normalizePayload(body) {
  return {
    name: typeof body?.name === "string" ? body.name.trim() : "",
    saving_type: typeof body?.saving_type === "string" ? body.saving_type.trim().toUpperCase() : "",
    description: typeof body?.description === "string" ? body.description.trim() : null,
    is_active: typeof body?.is_active === "boolean" ? body.is_active : true,
  };
}

export async function GET(request, { params }) {
  const authGuardError = assertAdminRequest(request);
  if (authGuardError) {
    return authGuardError;
  }

  const resolvedParams = await resolveRouteParams(params);
  if (!isUuid(resolvedParams?.id)) {
    return NextResponse.json({ error: "ID produk simpanan tidak valid." }, { status: 400 });
  }

  try {
    const saving_product = await fetchSavingProductById(resolvedParams.id);
    return NextResponse.json({ saving_product });
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
    return NextResponse.json({ error: "ID produk simpanan tidak valid." }, { status: 400 });
  }

  const body = await request.json();
  const payload = normalizePayload(body);

  if (!payload.name || !payload.saving_type) {
    return NextResponse.json(
      { error: "Nama produk dan tipe simpanan wajib diisi." },
      { status: 400 }
    );
  }

  if (!ALLOWED_SAVING_TYPES.includes(payload.saving_type)) {
    return NextResponse.json({ error: "Tipe simpanan tidak valid." }, { status: 400 });
  }

  try {
    const saving_product = await updateSavingProductById(resolvedParams.id, payload);
    return NextResponse.json({ saving_product });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}