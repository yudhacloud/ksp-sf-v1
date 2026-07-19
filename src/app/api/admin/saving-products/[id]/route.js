import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { fetchSavingProductById, updateSavingProductById } from "@/src/services/saving-products";

const ALLOWED_SAVING_TYPES = ["POKOK", "WAJIB", "SUKARELA"];

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

  try {
    const saving_product = await fetchSavingProductById(params.id);
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
    const saving_product = await updateSavingProductById(params.id, payload);
    return NextResponse.json({ saving_product });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}