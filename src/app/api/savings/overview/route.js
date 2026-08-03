import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { fetchSavingOverviewForMember } from "@/src/services/saving-overview-user";

export async function GET(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
   const accessToken = request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;

   if (!userId || !accessToken) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const overview = await fetchSavingOverviewForMember({
         accessToken,
         memberId: userId,
      });

      return NextResponse.json({ overview });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
