import { NextResponse } from "next/server";
import { createSavingProduct, fetchSavingProducts } from "@/src/services/saving-products";
import { validateSavingProductCreatePayload } from "@/src/services/saving-product-rules";
import { assertAdminRequest } from "@/src/lib/auth/server";

export async function GET(request) {
   const authGuardError = assertAdminRequest(request)
   if (authGuardError) {
      return authGuardError
   }

   try {
      const saving_products = await fetchSavingProducts();
      return NextResponse.json({ saving_products })
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
   }
}

export async function POST(request) {
   const authGuardError = assertAdminRequest(request)
   if (authGuardError) {
      return authGuardError
   }

   const body = await request.json()
   const { name, saving_type, is_active, description, default_amount } = body
   const normalizedName = typeof name === "string" ? name.trim() : ""
   const normalizedType = typeof saving_type === "string" ? saving_type.trim().toUpperCase() : ""
   const normalizedDescription = typeof description === "string" ? description.trim() : null
   const normalizedStatus = typeof is_active === "boolean" ? is_active : true
   const normalizedDefaultAmount = Number(default_amount || 0)

   if (!normalizedName || !normalizedType) {
      return NextResponse.json(
         { error: "Nama produk dan tipe simpanan wajib diisi." },
         { status: 400 }
      );
   }

   const validation = validateSavingProductCreatePayload({
      savingType: normalizedType,
      defaultAmount: normalizedDefaultAmount,
   });

   if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
   }

   try {
      const saving_product = await createSavingProduct({
         name: normalizedName,
         saving_type: validation.normalizedType,
         default_amount: validation.normalizedAmount,
         description: normalizedDescription,
         is_active: normalizedStatus,
      })

      return NextResponse.json({ saving_product })
   } catch (error) {
      return NextResponse.json(
         { error: error.message },
         { status: 500 }
      );
   }
}