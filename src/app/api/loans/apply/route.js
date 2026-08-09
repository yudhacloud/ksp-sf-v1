import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { createLoanApplication, fetchActiveLoanProductsForMembers } from "@/src/services/loan-applications-user";

export async function GET() {
   try {
      const products = await fetchActiveLoanProductsForMembers();
      return NextResponse.json({ products });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}

export async function POST(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;

   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const body = await request.json();
      const payload = {
         memberId: userId,
         loanProductId: body?.loanProductId,
         amount: body?.amount,
         tenor: body?.tenor,
         purpose: body?.purpose,
      };

      const application = await createLoanApplication(payload);
      return NextResponse.json({ application });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
   }
}
