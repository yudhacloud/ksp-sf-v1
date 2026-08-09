import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { fetchAllLoanApplications } from "@/src/services/loan-applications-user";

export async function GET(request) {
   const authGuardError = assertAdminRequest(request);
   if (authGuardError) {
      return authGuardError;
   }

   try {
      const applications = await fetchAllLoanApplications();
      return NextResponse.json({ applications });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
