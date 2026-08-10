import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { createInstallmentPayment } from "@/src/services/loan-installments-user";

export async function POST(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
   const accessToken = request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;

   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const body = await request.json();
      const payment = await createInstallmentPayment({
         memberId: userId,
         installmentId: body.installmentId,
         amount: body.amount,
         paymentDate: body.paymentDate,
         note: body.note,
         proofUrl: body.proofUrl,
         accessToken,
      });

      return NextResponse.json({ payment });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
