import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { createLoanApplication, fetchActiveLoanProductsForMembers } from "@/src/services/loan-applications-user";
import { createAdminReviewNotifications } from "@/src/services/notifications";

export async function GET(request) {
   const accessToken = request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;

   try {
      const products = await fetchActiveLoanProductsForMembers(accessToken || null);
      return NextResponse.json({ products });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}

export async function POST(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
   const accessToken = request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;

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
         accessToken: accessToken || null,
      };

      const application = await createLoanApplication(payload);

      await createAdminReviewNotifications({
         title: "Pengajuan pinjaman baru",
         message: "Ada pengajuan pinjaman baru yang menunggu persetujuan admin.",
         type: "info",
         relatedEntity: "loan_application",
         relatedId: application?.id || null,
      });

      return NextResponse.json({ application });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
   }
}
