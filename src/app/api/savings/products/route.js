import { NextResponse } from "next/server";
import { fetchActiveSavingProducts } from "@/src/services/saving-products";

export async function GET() {
   try {
      const saving_products = await fetchActiveSavingProducts();
      return NextResponse.json({ saving_products });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
