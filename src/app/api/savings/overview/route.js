import { NextResponse } from "next/server";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/src/lib/auth/cookies";
import { fetchSavingOverviewForMember } from "@/src/services/saving-overview-user";

function isAuthError(error) {
   const message = String(error?.message || "").toLowerCase();
   return message.includes("jwt") || message.includes("token") || message.includes("expired") || message.includes("unauthorized") || message.includes("invalid");
}

export async function GET(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
   const accessToken = request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;

   if (!userId || !accessToken) {
      const response = NextResponse.json({ error: "Sesi Anda telah berakhir. Silakan login kembali." }, { status: 401 });
      response.cookies.delete(AUTH_COOKIE.ACCESS_TOKEN, COOKIE_OPTIONS);
      response.cookies.delete(AUTH_COOKIE.ROLE, COOKIE_OPTIONS);
      response.cookies.delete(AUTH_COOKIE.USER_ID, COOKIE_OPTIONS);
      return response;
   }

   try {
      const overview = await fetchSavingOverviewForMember({
         accessToken,
         memberId: userId,
      });

      return NextResponse.json({ overview });
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
