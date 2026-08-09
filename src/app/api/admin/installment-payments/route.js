import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { fetchAdminInstallments } from "@/src/services/loan-admin";

export async function GET(request) {
   const authGuardError = assertAdminRequest(request);
   if (authGuardError) {
      return authGuardError;
   }

   try {
      const installments = await fetchAdminInstallments();
      return NextResponse.json({ installments });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
