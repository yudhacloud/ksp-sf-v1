import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/client";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";

const INSTALLMENT_PROOF_BUCKET = process.env.SUPABASE_INSTALLMENT_PROOF_BUCKET || "installment-payment-proofs";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function sanitizeFilename(filename) {
   return String(filename || "proof")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
}

async function ensureBucketExists() {
   const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

   if (listError) {
      throw new Error(listError.message);
   }

   const exists = (buckets || []).some((bucket) => bucket.name === INSTALLMENT_PROOF_BUCKET);
   if (exists) {
      return;
   }

   const { error: createError } = await supabaseAdmin.storage.createBucket(INSTALLMENT_PROOF_BUCKET, {
      public: true,
      fileSizeLimit: String(MAX_FILE_SIZE_BYTES),
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
   });

   if (createError && !String(createError.message || "").toLowerCase().includes("already exists")) {
      throw new Error(createError.message);
   }
}

export async function POST(request) {
   const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;

   if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
   }

   if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin client tidak tersedia." }, { status: 500 });
   }

   try {
      const formData = await request.formData();
      const proof = formData.get("proof");
      const installmentId = String(formData.get("installmentId") || "").trim();

      if (!(proof instanceof File)) {
         return NextResponse.json({ error: "File bukti tidak valid." }, { status: 400 });
      }

      if (!installmentId) {
         return NextResponse.json({ error: "ID cicilan tidak valid." }, { status: 400 });
      }

      if (proof.size > MAX_FILE_SIZE_BYTES) {
         return NextResponse.json({ error: "Ukuran file maksimal 5MB." }, { status: 400 });
      }

      await ensureBucketExists();

      const safeName = sanitizeFilename(proof.name || "proof");
      const ext = safeName.includes(".") ? safeName.split(".").pop() : "bin";
      const storagePath = `${userId}/${installmentId}/${Date.now()}.${ext}`;

      const arrayBuffer = await proof.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
         .from(INSTALLMENT_PROOF_BUCKET)
         .upload(storagePath, fileBuffer, {
            contentType: proof.type || "application/octet-stream",
            upsert: false,
         });

      if (uploadError) {
         throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabaseAdmin.storage
         .from(INSTALLMENT_PROOF_BUCKET)
         .getPublicUrl(storagePath);

      return NextResponse.json({
         proofUrl: publicUrlData?.publicUrl || `${INSTALLMENT_PROOF_BUCKET}/${storagePath}`,
         bucket: INSTALLMENT_PROOF_BUCKET,
         path: storagePath,
      });
   } catch (error) {
      return NextResponse.json({ error: error.message || "Gagal upload bukti pembayaran." }, { status: 500 });
   }
}
