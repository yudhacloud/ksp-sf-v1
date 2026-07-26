import { fetchSavingTransactions } from "@/src/services/saving-transactions";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { NextResponse } from "next/server";

export async function GET(request) {
   const authGuardError = assertAdminRequest(request)
   if (authGuardError) {
      return authGuardError
   }

   try {
      const saving_transactions = await fetchSavingTransactions();
      return NextResponse.json({ saving_transactions })
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
   }
}