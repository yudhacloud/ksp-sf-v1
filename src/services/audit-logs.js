import { supabaseAdmin } from "@/src/lib/supabase/client";

function formatReadableDetails(details) {
   if (!details || typeof details !== "object") {
      return "";
   }

   const entries = Object.entries(details)
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => {
         const label = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

         const formattedValue = typeof value === "string" && value.length > 80
            ? `${value.slice(0, 77)}...`
            : String(value);

         return `${label}: ${formattedValue}`;
      });

   return entries.join(" • ");
}

export async function createAuditLog({
   actorId = null,
   actorRole = "system",
   action = "",
   entityType = "system",
   entityId = null,
   description = "",
   details = null,
}) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   if (!action) {
      return null;
   }

   const readableDetails = formatReadableDetails(details);
   const finalDescription = [description || action, readableDetails].filter(Boolean).join(" • ");

   const payload = {
      actor_id: actorId,
      table_name: entityType,
      record_id: entityId,
      action,
      description: finalDescription,
   };

   const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .insert([payload])
      .select("id, actor_id, table_name, record_id, action, description, created_at")
      .single();

   if (error) {
      throw new Error(error.message);
   }

   return data;
}

export async function fetchAuditLogs({
   limit = 50,
   entityType = null,
   actorRole = null,
} = {}) {
   if (!supabaseAdmin) {
      throw new Error("Supabase admin client tidak tersedia.");
   }

   let query = supabaseAdmin
      .from("audit_logs")
      .select("id, actor_id, table_name, record_id, action, description, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

   if (entityType) {
      query = query.eq("table_name", entityType);
   }

   if (actorRole) {
      query = query.filter("actor_id", "not.eq", null);
   }

   const { data, error } = await query;

   if (error) {
      throw new Error(error.message);
   }

   return data || [];
}
