import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { supabaseAdmin } from "@/src/lib/supabase/client";
import { ensureMemberObligationsForCurrentMonth } from "@/src/services/saving-accounts-user";

function formatDateInput(date) {
   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getPreviousMonthStartDate() {
   const now = new Date();
   return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

export async function POST(request) {
   if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Endpoint ini hanya untuk lingkungan development." }, { status: 403 });
   }

   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const previousMonthStart = formatDateInput(getPreviousMonthStartDate());

      const { error: updateError } = await supabaseAdmin
         .from("saving_accounts")
         .update({ start_date: previousMonthStart })
         .eq("member_id", userId)
         .eq("status", "ACTIVE");

      if (updateError) {
         throw new Error(updateError.message);
      }

      await ensureMemberObligationsForCurrentMonth({ memberId: userId });

      return NextResponse.json({
         success: true,
         message: "Tagihan wajib sudah disimulasi untuk bulan sebelumnya.",
         simulatedStartDate: previousMonthStart,
      });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
