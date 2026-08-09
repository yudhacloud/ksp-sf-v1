import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { updateLoanApplicationStatusById } from "@/src/services/loan-applications-user";

function isUuid(value) {
   return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveRouteParams(params) {
   return Promise.resolve(params);
}

export async function PATCH(request, { params }) {
   const authGuardError = assertAdminRequest(request);
   if (authGuardError) {
      return authGuardError;
   }

   const resolvedParams = await resolveRouteParams(params);
   const applicationId = resolvedParams?.id;
   if (!isUuid(applicationId)) {
      return NextResponse.json({ error: "ID pengajuan tidak valid." }, { status: 400 });
   }

   const reviewedBy = request.cookies.get(AUTH_COOKIE.USER_ID)?.value || null;

   const body = await request.json();
   const status = typeof body?.status === "string" ? body.status.trim().toUpperCase() : "";
   const adminNote = typeof body?.admin_note === "string" ? body.admin_note.trim() : "";

   if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status pengajuan tidak valid." }, { status: 400 });
   }

   if (status === "REJECTED" && !adminNote) {
      return NextResponse.json({ error: "Catatan penolakan wajib diisi." }, { status: 400 });
   }

   try {
      const application = await updateLoanApplicationStatusById(applicationId, status, adminNote || null, reviewedBy);
      return NextResponse.json({ application });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
