import { fetchSavingProducts } from "@/src/services/saving-products";
import { NextResponse } from "next/server";

export async function GET() {
   try {
      const saving_products = await fetchSavingProducts();
      return NextResponse.json({saving_products})
   } catch (error) {
      return NextResponse.json({error: error.message}, {status: 500})
   }
}