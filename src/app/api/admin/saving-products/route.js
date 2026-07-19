import { NextResponse } from "next/server";
import { createSavingProduct, fetchSavingProducts } from "@/src/services/saving-products";
import { assertAdminRequest } from "@/src/lib/auth/server";

export async function GET(request) {
   const authGuardError = assertAdminRequest(request)
   if (authGuardError) {
      return authGuardError
   }
   
   try {
      const saving_products = await fetchSavingProducts();
      return NextResponse.json({saving_products})
   } catch (error) {
      return NextResponse.json({error: error.message}, {status: 500})
   }
}

export async function POST(request) {
   const authGuardError = assertAdminRequest(request)
   if (authGuardError) {
      return authGuardError
   }

   const body = await request.json()
   const { name, saving_type, is_active, description } = body
   const normalizedName = typeof name === "string" ? name.trim() : ""
   const normalizedType = typeof saving_type === "string" ? saving_type.trim().toUpperCase() : ""
   const normalizedDescription = typeof description === "string" ? description.trim() : null
   const normalizedStatus = typeof is_active === "boolean" ? is_active : true
   const allowedTypes = ["POKOK", "WAJIB", "SUKARELA"]

   if (!normalizedName || !normalizedType) {
      return NextResponse.json(
      { error: "Nama produk dan tipe simpanan wajib diisi." },
      { status: 400 }
    );
   }

   if (!allowedTypes.includes(normalizedType)) {
      return NextResponse.json(
         { error: "Tipe simpanan tidak valid." },
         { status: 400 }
      );
   }

   try {
      const saving_product = await createSavingProduct({
         name: normalizedName,
         saving_type: normalizedType,
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