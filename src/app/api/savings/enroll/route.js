import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { enrollMemberInSavingProducts } from "@/src/services/saving-accounts-user";

export async function POST(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const body = await request.json();
      const productIds = Array.isArray(body?.productIds) ? body.productIds : [];

      if (!productIds.length) {
         return NextResponse.json({ error: "Pilih minimal satu produk simpanan." }, { status: 400 });
      }

      const enrolled = await enrollMemberInSavingProducts({
         memberId: userId,
         productIds,
      });

      return NextResponse.json({ enrolled });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
