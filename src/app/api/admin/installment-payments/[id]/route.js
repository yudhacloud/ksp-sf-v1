import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/src/lib/auth/server";
import { updateInstallmentPaymentStatusById } from "@/src/services/loan-admin";
import { createAuditLog } from "@/src/services/audit-logs";
import { createNotification } from "@/src/services/notifications";

const ALLOWED_STATUSES = ["APPROVED", "REJECTED"];

function isUuid(value) {
   return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizePayload(body) {
   return {
      status: typeof body?.status === "string" ? body.status.trim().toUpperCase() : "",
      admin_note: typeof body?.admin_note === "string" ? body.admin_note.trim() : "",
   };
}

export async function PATCH(request, { params }) {
   const authGuardError = assertAdminRequest(request);
   if (authGuardError) {
      return authGuardError;
   }

   const resolvedParams = await Promise.resolve(params);
   if (!isUuid(resolvedParams?.id)) {
      return NextResponse.json({ error: "ID pembayaran cicilan tidak valid." }, { status: 400 });
   }

   const body = await request.json();
   const payload = normalizePayload(body);

   if (!ALLOWED_STATUSES.includes(payload.status)) {
      return NextResponse.json({ error: "Status pembayaran tidak valid." }, { status: 400 });
   }

   if (payload.status === "REJECTED" && !payload.admin_note) {
      return NextResponse.json({ error: "Alasan penolakan wajib diisi." }, { status: 400 });
   }

   try {
      const payment = await updateInstallmentPaymentStatusById(resolvedParams.id, payload.status, payload.admin_note || null);

      const adminUserId = request.cookies.get("user_id")?.value || null;
      await createAuditLog({
         actorId: adminUserId,
         actorRole: "admin",
         action: payload.status === "APPROVED" ? "installment_payment_approved" : "installment_payment_rejected",
         entityType: "installment_payment",
         entityId: resolvedParams.id,
         description: payload.status === "APPROVED"
            ? "Pembayaran cicilan disetujui oleh admin."
            : "Pembayaran cicilan ditolak oleh admin.",
         details: { status: payload.status, admin_note: payload.admin_note || null },
      });

      if (payment?.member_id) {
         await createNotification({
            recipientId: payment.member_id,
            recipientRole: "member",
            title: payload.status === "APPROVED" ? "Pembayaran cicilan disetujui" : "Pembayaran cicilan ditolak",
            message: payload.status === "APPROVED"
               ? "Pembayaran cicilan Anda telah diterima dan diverifikasi."
               : `Pembayaran cicilan Anda ditolak. ${payload.admin_note ? `Alasan: ${payload.admin_note}` : ""}`.trim(),
            type: payload.status === "APPROVED" ? "success" : "warning",
            relatedEntity: "installment_payment",
            relatedId: resolvedParams.id,
         });
      }

      return NextResponse.json({ payment });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
