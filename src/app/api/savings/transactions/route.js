import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { createSavingTransaction } from "@/src/services/saving-transactions-user";

export async function POST(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const body = await request.json();
      const accessToken = request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;
      const obligationId = body.obligationId;
      const amount = Number(body.amount || 0);
      const paymentDate = body.paymentDate;
      const note = typeof body.note === "string" ? body.note.trim() : "";
      const proofUrl = typeof body.proofUrl === "string" ? body.proofUrl.trim() : null;

      if (!obligationId || !amount || amount <= 0) {
         return NextResponse.json({ error: "Data pembayaran tidak lengkap." }, { status: 400 });
      }

      const transaction = await createSavingTransaction({
         accessToken,
         memberId: userId,
         obligationId,
         amount,
         paymentDate,
         note,
         proofUrl,
      });

      return NextResponse.json({ transaction });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
