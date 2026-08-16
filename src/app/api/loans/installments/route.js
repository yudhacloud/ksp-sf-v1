import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { createInstallmentPayment } from "@/src/services/loan-installments-user";
import { createAuditLog } from "@/src/services/audit-logs";
import { createAdminReviewNotifications, createNotification } from "@/src/services/notifications";

export async function POST(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
   const accessToken = request.cookies.get(AUTH_COOKIE.ACCESS_TOKEN)?.value;

   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const body = await request.json();
      const payment = await createInstallmentPayment({
         memberId: userId,
         installmentId: body.installmentId,
         amount: body.amount,
         paymentDate: body.paymentDate,
         note: body.note,
         proofUrl: body.proofUrl,
         accessToken,
      });

      await createAuditLog({
         actorId: userId,
         actorRole: "member",
         action: "installment_payment_submitted",
         entityType: "installment_payment",
         entityId: payment.id,
         description: "Pembayaran cicilan dikirim oleh anggota.",
         details: { installment_id: body.installmentId, amount: body.amount },
      });

      await createNotification({
         recipientId: userId,
         recipientRole: "member",
         title: "Pembayaran cicilan dikirim",
         message: "Bukti pembayaran Anda telah dikirim dan sedang menunggu verifikasi admin.",
         type: "info",
         relatedEntity: "installment_payment",
         relatedId: payment.id,
      });

      await createAdminReviewNotifications({
         title: "Pembayaran cicilan menunggu verifikasi",
         message: "Ada pembayaran cicilan baru yang menunggu persetujuan admin.",
         type: "info",
         relatedEntity: "installment_payment",
         relatedId: payment.id,
      });

      return NextResponse.json({ payment });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
