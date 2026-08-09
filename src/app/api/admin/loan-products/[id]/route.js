import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { fetchLoanProductById, updateLoanProductById } from "@/src/services/loan-products";

async function getProductId(params) {
  if (!params) {
    return null;
  }

  if (typeof params === "object" && typeof params.then === "function") {
    return (await params).id;
  }

  return params.id;
}

function normalizePayload(body) {
  return {
    name: typeof body?.name === "string" ? body.name.trim() : "",
    max_amount: Number(body?.max_amount),
    interest_rate: Number(body?.interest_rate),
    max_tenor: Number(body?.max_tenor),
    is_active: typeof body?.is_active === "boolean" ? body.is_active : true,
  };
}

function validatePayload(payload) {
  if (!payload.name) return "Nama produk wajib diisi.";
  if (!Number.isFinite(payload.max_amount) || payload.max_amount <= 0) return "Maksimal nominal harus lebih besar dari 0.";
  if (!Number.isFinite(payload.interest_rate) || payload.interest_rate < 0) return "Suku bunga tidak valid.";
  if (!Number.isFinite(payload.max_tenor) || payload.max_tenor <= 0) return "Maksimal tenor harus lebih besar dari 0.";
  return null;
}

export async function GET(request, context) {
  const authGuardError = assertAdminRequest(request);
  if (authGuardError) {
    return authGuardError;
  }

  try {
    const productId = await getProductId(context?.params);
    if (!productId) {
      return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 });
    }

    const loan_product = await fetchLoanProductById(productId);
    return NextResponse.json({ loan_product });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  const authGuardError = assertAdminRequest(request);
  if (authGuardError) {
    return authGuardError;
  }

  try {
    const productId = await getProductId(context?.params);
    if (!productId) {
      return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 });
    }

    const body = await request.json();
    const payload = normalizePayload(body);
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const loan_product = await updateLoanProductById(productId, payload);
    return NextResponse.json({ loan_product });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}