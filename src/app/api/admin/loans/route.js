import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { fetchAdminLoans } from "@/src/services/loan-admin";

export async function GET(request) {
   const authGuardError = assertAdminRequest(request);
   if (authGuardError) {
      return authGuardError;
   }

   try {
      const loans = await fetchAdminLoans();
      return NextResponse.json({ loans });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
