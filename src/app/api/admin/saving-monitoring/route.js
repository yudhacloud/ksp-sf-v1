import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { fetchSavingMonitoring } from "@/src/services/saving-monitoring";

export async function GET(request) {
   const authGuardError = assertAdminRequest(request);
   if (authGuardError) {
      return authGuardError;
   }

   try {
      const saving_monitoring = await fetchSavingMonitoring();
      return NextResponse.json({ saving_monitoring });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
