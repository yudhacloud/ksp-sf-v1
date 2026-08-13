"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/ui/PageHeader";
import { toastError, toastSuccess, toastWarning } from "@/src/lib/toast";

export default function AdminMemberCreatePage() {
   const router = useRouter();
   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [phone, setPhone] = useState("");
   const [password] = useState("password123");
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");

   async function handleSubmit(event) {
      event.preventDefault();
      setLoading(true);
      setMessage("");

      try {
         const response = await fetch("/api/admin/members", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               full_name: fullName,
               email,
               phone,
               password,
            }),
         });

         const result = await response.json();
         setLoading(false);

         if (!response.ok) {
            toastWarning(result.error || "Gagal menambahkan anggota.");
            return;
         }

         toastSuccess("Anggota baru berhasil ditambahkan.");
         router.push("/admin/members");
      } catch (error) {
         setLoading(false);
         toastError(error?.message || "Gagal menghubungi server.");
      }
   }

   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title="Tambah Anggota"
            subtitle="Buat akun baru untuk anggota yang didaftarkan oleh admin."
         />

         <div className="admin-card">
            <form onSubmit={handleSubmit}>
               <div className="row gy-3">
                  <div className="col-12 col-md-6">
                     <label className="form-label" htmlFor="fullName">
                        Nama Lengkap
                     </label>
                     <input
                        id="fullName"
                        className="form-control"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        required
                     />
                  </div>

                  <div className="col-12 col-md-6">
                     <label className="form-label" htmlFor="email">
                        Email
                     </label>
                     <input
                        id="email"
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                     />
                  </div>

                  <div className="col-12 col-md-6">
                     <label className="form-label" htmlFor="phone">
                        Nomor Telepon
                     </label>
                     <input
                        id="phone"
                        type="tel"
                        className="form-control"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                     />
                  </div>

                  <div className="col-12 col-md-6">
                     <label className="form-label" htmlFor="password">
                        Password
                     </label>
                     <input
                        id="password"
                        type="text"
                        className="form-control"
                        value={password}
                        readOnly
                        aria-readonly="true"
                     />
                  </div>
               </div>

               {message && (
                  <div className="alert alert-danger mt-4" role="alert">
                     {message}
                  </div>
               )}

               <div className="mt-4 d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                     {loading ? "Menyimpan..." : "Tambah Anggota"}
                  </button>
                  <a href="/admin/members" className="btn btn-outline-secondary">
                     Batal
                  </a>
               </div>
            </form>
         </div>
      </section>
   );
}
