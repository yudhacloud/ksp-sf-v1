import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { fetchSavingProductById, updateSavingProductById } from "@/src/services/saving-products";
import { isRequiredSavingType, normalizeSavingType, normalizeSavingProductUpdatePayload } from "@/src/services/saving-product-rules";

const ALLOWED_SAVING_TYPES = ["POKOK", "WAJIB", "SUKARELA"];

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveRouteParams(params) {
  return Promise.resolve(params);
}

function normalizePayload(body) {
  const savingType = normalizeSavingType(body?.saving_type);
  const basePayload = {
    name: typeof body?.name === "string" ? body.name.trim() : "",
    saving_type: savingType,
    default_amount: Number(body?.default_amount || 0),
    description: typeof body?.description === "string" ? body.description.trim() : null,
    is_active: typeof body?.is_active === "boolean" ? body.is_active : true,
  };

  return normalizeSavingProductUpdatePayload(basePayload);
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

  const currentProduct = await fetchSavingProductById(resolvedParams.id);

  if (!payload.name || !payload.saving_type) {
    return NextResponse.json(
      { error: "Nama produk dan tipe simpanan wajib diisi." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(payload.default_amount) || payload.default_amount <= 0) {
    return NextResponse.json(
      { error: "Nominal simpanan wajib lebih dari 0." },
      { status: 400 }
    );
  }

  if (!ALLOWED_SAVING_TYPES.includes(payload.saving_type)) {
    return NextResponse.json({ error: "Tipe simpanan tidak valid." }, { status: 400 });
  }

  if (isRequiredSavingType(currentProduct.saving_type)) {
    if (payload.saving_type !== currentProduct.saving_type) {
      return NextResponse.json(
        { error: "Produk simpanan pokok dan wajib tidak dapat mengubah tipe." },
        { status: 400 }
      );
    }

    payload.saving_type = currentProduct.saving_type;
    payload.is_active = true;
  }

  try {
    const saving_product = await updateSavingProductById(resolvedParams.id, payload);
    return NextResponse.json({ saving_product });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}