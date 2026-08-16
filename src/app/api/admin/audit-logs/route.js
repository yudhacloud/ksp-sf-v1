import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { fetchAuditLogs } from "@/src/services/audit-logs";

export async function GET(request) {
   const authGuardError = assertAdminRequest(request);
   if (authGuardError) {
      return authGuardError;
   }

   try {
      const { searchParams } = new URL(request.url);
      const limit = Number(searchParams.get("limit") || 50);
      const entityType = searchParams.get("entityType") || null;
      const actorRole = searchParams.get("actorRole") || null;

      const logs = await fetchAuditLogs({
         limit: Number.isFinite(limit) && limit > 0 ? limit : 50,
         entityType,
         actorRole,
      });

      return NextResponse.json({ logs });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
