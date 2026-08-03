import { NextResponse } from "next/server";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/src/lib/auth/cookies";
import { createSavingTransaction } from "@/src/services/saving-transactions-user";

function isAuthError(error) {
   const message = String(error?.message || "").toLowerCase();
   return message.includes("jwt") || message.includes("token") || message.includes("expired") || message.includes("unauthorized") || message.includes("invalid");
}

export async function POST(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
   if (!userId) {
      const response = NextResponse.json({ error: "Sesi Anda telah berakhir. Silakan login kembali." }, { status: 401 });
      response.cookies.delete(AUTH_COOKIE.ACCESS_TOKEN, COOKIE_OPTIONS);
      response.cookies.delete(AUTH_COOKIE.ROLE, COOKIE_OPTIONS);
      response.cookies.delete(AUTH_COOKIE.USER_ID, COOKIE_OPTIONS);
      return response;
   }

   try {
      const body = await request.json();
      const accessToken = request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;
      const obligationId = body.obligationId;
      const amount = Number(body.amount || 0);
      const paymentDate = body.paymentDate;
      const note = typeof body.note === "string" ? body.note.trim() : "";
      const proofUrl = typeof body.proofUrl === "string" ? body.proofUrl.trim() : null;

      if (!accessToken) {
         const response = NextResponse.json({ error: "Sesi Anda telah berakhir. Silakan login kembali." }, { status: 401 });
         response.cookies.delete(AUTH_COOKIE.ACCESS_TOKEN, COOKIE_OPTIONS);
         response.cookies.delete(AUTH_COOKIE.ROLE, COOKIE_OPTIONS);
         response.cookies.delete(AUTH_COOKIE.USER_ID, COOKIE_OPTIONS);
         return response;
      }

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
      if (isAuthError(error)) {
         const response = NextResponse.json({ error: "Sesi Anda telah berakhir. Silakan login kembali." }, { status: 401 });
         response.cookies.delete(AUTH_COOKIE.ACCESS_TOKEN, COOKIE_OPTIONS);
         response.cookies.delete(AUTH_COOKIE.ROLE, COOKIE_OPTIONS);
         response.cookies.delete(AUTH_COOKIE.USER_ID, COOKIE_OPTIONS);
         return response;
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
