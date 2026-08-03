"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/ui/PageHeader";

export default function AdminMemberCreatePage() {
   const router = useRouter();
   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [phone, setPhone] = useState("");
   const [password, setPassword] = useState("");
   const [role, setRole] = useState("member");
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
               role,
            }),
         });

         const result = await response.json();
         setLoading(false);

         if (!response.ok) {
            setMessage(result.error || "Gagal menambahkan anggota.");
            return;
         }

         router.push("/admin/members");
      } catch (error) {
         setLoading(false);
         setMessage(error?.message || "Gagal menghubungi server.");
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
                        type="password"
                        className="form-control"
                        value={password}
                        minLength={6}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                     />
                  </div>

                  <div className="col-12 col-md-6">
                     <label className="form-label" htmlFor="role">
                        Peran Anggota
                     </label>
                     <select
                        id="role"
                        className="form-select"
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                     >
                        <option value="member">Anggota</option>
                        <option value="admin">Admin</option>
                     </select>
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
