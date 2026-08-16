import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { fetchNotifications, markNotificationAsRead } from "@/src/services/notifications";

export async function GET(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
   const role = request.cookies.get(AUTH_COOKIE.ROLE)?.value || "member";

   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const { searchParams } = new URL(request.url);
      const unreadOnly = searchParams.get("unreadOnly") === "true";
      const limit = Number(searchParams.get("limit") || 20);

      const notifications = await fetchNotifications({
         recipientId: userId,
         recipientRole: role,
         unreadOnly,
         limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
      });

      return NextResponse.json({ notifications });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}

export async function PATCH(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;

   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const body = await request.json();
      const notificationId = body?.notificationId;

      if (!notificationId) {
         return NextResponse.json({ error: "notificationId wajib diisi." }, { status: 400 });
      }

      const result = await markNotificationAsRead(notificationId);
      return NextResponse.json({ result });
   } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }
}
