"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/src/components/ui/PageHeader";

export default function AdminMemberEditPage() {
   const params = useParams();
   const router = useRouter();
   const memberId = params?.id;

   const [memberNumber, setMemberNumber] = useState("");
   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [phone, setPhone] = useState("");
   const [role, setRole] = useState("member");
   const [status, setStatus] = useState(true);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [message, setMessage] = useState("");

   useEffect(() => {
      if (!memberId) {
         return;
      }

      let active = true;

      async function loadMember() {
         setLoading(true);
         setMessage("");

         try {
            const response = await fetch(`/api/admin/members/${memberId}`);
            const result = await response.json();

            if (!response.ok) {
               throw new Error(result.error || "Gagal mengambil data anggota.");
            }

            if (!active) {
               return;
            }

            const member = result.member;
            setMemberNumber(member.member_number || "");
            setFullName(member.full_name || "");
            setEmail(member.email || "");
            setPhone(member.phone || "");
            setRole(member.role === "admin" ? "admin" : "member");
            setStatus(Boolean(member.status));
         } catch (error) {
            if (active) {
               setMessage(error?.message || "Gagal mengambil data anggota.");
            }
         } finally {
            if (active) {
               setLoading(false);
            }
         }
      }

      loadMember();

      return () => {
         active = false;
      };
   }, [memberId]);

   async function handleSubmit(event) {
      event.preventDefault();
      setSaving(true);
      setMessage("");

      try {
         const response = await fetch(`/api/admin/members/${memberId}`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               full_name: fullName,
               phone,
               role,
               status,
            }),
         });

         const result = await response.json();
         setSaving(false);

         if (!response.ok) {
            setMessage(result.error || "Gagal memperbarui anggota.");
            return;
         }

         router.push("/admin/members");
      } catch (error) {
         setSaving(false);
         setMessage(error?.message || "Gagal menghubungi server.");
      }
   }

   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title="Edit Anggota"
            subtitle="Perbarui data anggota, status, dan perannya dari panel admin."
         />

         <div className="admin-card">
            {loading ? (
               <div className="py-4 text-center text-muted">Memuat data anggota...</div>
            ) : (
               <form onSubmit={handleSubmit}>
                  <div className="row gy-3">
                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="memberNumber">
                           Nomor Anggota
                        </label>
                        <input id="memberNumber" className="form-control" value={memberNumber} readOnly />
                     </div>

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="email">
                           Email
                        </label>
                        <input id="email" type="email" className="form-control" value={email} readOnly />
                     </div>

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

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="status">
                           Status Anggota
                        </label>
                        <select
                           id="status"
                           className="form-select"
                           value={status ? "aktif" : "nonaktif"}
                           onChange={(event) => setStatus(event.target.value === "aktif")}
                        >
                           <option value="aktif">Aktif</option>
                           <option value="nonaktif">Nonaktif</option>
                        </select>
                     </div>
                  </div>

                  {message && (
                     <div className="alert alert-danger mt-4" role="alert">
                        {message}
                     </div>
                  )}

                  <div className="mt-4 d-flex gap-2">
                     <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                     </button>
                     <a href="/admin/members" className="btn btn-outline-secondary">
                        Batal
                     </a>
                  </div>
               </form>
            )}
         </div>
      </section>
   );
}