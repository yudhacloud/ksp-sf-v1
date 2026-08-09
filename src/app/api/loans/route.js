import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { fetchMemberLoanApplications } from "@/src/services/loan-applications-user";

export async function GET(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;

   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const applications = await fetchMemberLoanApplications(userId);
      return NextResponse.json({ applications });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
