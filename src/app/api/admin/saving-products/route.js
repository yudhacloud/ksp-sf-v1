import { NextResponse } from "next/server";
import { fetchSavingProducts } from "@/src/services/saving-products";
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