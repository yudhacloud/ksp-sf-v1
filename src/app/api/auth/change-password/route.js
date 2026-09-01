import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/src/lib/supabase/client";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";

export async function POST(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;

   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   try {
      const body = await request.json();
      const { old_password, new_password } = body;

      if (!old_password || !new_password) {
         return NextResponse.json(
            { error: "Password lama dan baru wajib diisi." },
            { status: 400 }
         );
      }

      if (new_password.length < 6) {
         return NextResponse.json(
            { error: "Password baru minimal 6 karakter." },
            { status: 400 }
         );
      }

      // Get the user's email from profiles
      if (!supabaseAdmin) {
         return NextResponse.json(
            { error: "Supabase admin client tidak tersedia." },
            { status: 500 }
         );
      }

      const { data: profile, error: profileError } = await supabaseAdmin
         .from("profiles")
         .select("email")
         .eq("id", userId)
         .single();

      if (profileError || !profile) {
         return NextResponse.json(
            { error: "Gagal mengambil data profil." },
            { status: 400 }
         );
      }

      const email = profile.email;

      // First, verify old password by attempting sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
         email,
         password: old_password,
      });

      if (signInError) {
         return NextResponse.json(
            { error: "Password lama tidak sesuai." },
            { status: 400 }
         );
      }

      // Update password using admin API
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
         userId,
         { password: new_password }
      );

      if (updateError) {
         throw new Error(updateError.message);
      }

      return NextResponse.json({
         message: "Password berhasil diubah.",
      });
   } catch (error) {
      console.error("Change password error:", error);
      return NextResponse.json(
         { error: error.message || "Gagal mengganti password." },
         { status: 500 }
      );
   }
}
