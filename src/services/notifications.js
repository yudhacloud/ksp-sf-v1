import { supabaseAdmin } from "@/src/lib/supabase/client";

export async function createNotification({
   recipientId,
   recipientRole = "member",
   title = "Notifikasi",
   message = "",
   type = "info",
   relatedEntity = null,
   relatedId = null,
   isRead = false,
}) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   const memberId = recipientId || null;
   if (!memberId) {
      throw new Error("recipientId wajib diisi.");
   }

   const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert([
         {
            member_id: memberId,
            title,
            message,
            is_read: isRead,
         },
      ])
      .select("id, member_id, title, message, is_read, created_at")
      .single();

   if (error) {
      throw new Error(error.message);
   }

   return data;
}

export async function createAdminReviewNotifications({
   title = "Notifikasi review",
   message = "Ada item yang menunggu review admin.",
   type = "info",
   relatedEntity = null,
   relatedId = null,
   isRead = false,
} = {}) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   const { data: admins, error: adminsError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "admin");

   if (adminsError) {
      throw new Error(adminsError.message);
   }

   if (!admins || admins.length === 0) {
      return [];
   }

   const rows = admins.map((admin) => ({
      member_id: admin.id,
      title,
      message,
      is_read: isRead,
   }));

   const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert(rows)
      .select("id, member_id, title, message, is_read, created_at");

   if (error) {
      throw new Error(error.message);
   }

   return data || [];
}

export async function fetchNotifications({ recipientId, recipientRole = null, unreadOnly = false, limit = 20 } = {}) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   if (!recipientId) {
      return [];
   }

   let query = supabaseAdmin
      .from("notifications")
      .select("id, member_id, title, message, is_read, created_at")
      .eq("member_id", recipientId)
      .order("created_at", { ascending: false })
      .limit(limit);

   if (unreadOnly) {
      query = query.eq("is_read", false);
   }

   const { data, error } = await query;

   if (error) {
      throw new Error(error.message);
   }

   return data || [];
}

export async function markNotificationAsRead(notificationId) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .select("id, is_read");

   if (error) {
      throw new Error(error.message);
   }

   return data;
}
