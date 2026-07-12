"use client";

import { useMemo, useState } from "react";
import styles from "./MembersTable.module.css";

/**
 * Komponen client untuk menampilkan tabel anggota.
 * Search dan filter dijalankan di frontend menggunakan data yang sudah di-fetch.
 */
export default function MembersTable({ members }) {
   const [search, setSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState("Semua");
   const [joinedFilter, setJoinedFilter] = useState("Semua waktu");

   const filteredMembers = useMemo(() => {
      const normalizedSearch = search.trim().toLowerCase();
      const now = new Date();

      return members.filter((member) => {
         const matchesSearch =
            normalizedSearch === "" ||
            member.full_name.toLowerCase().includes(normalizedSearch) ||
            member.member_number.toLowerCase().includes(normalizedSearch);

         const matchesStatus =
            statusFilter === "Semua" ||
            (statusFilter === "Aktif" && member.status) ||
            (statusFilter === "Nonaktif" && !member.status);

         if (!matchesSearch || !matchesStatus) {
            return false;
         }

         if (joinedFilter === "30 hari terakhir" || joinedFilter === "90 hari terakhir") {
            const createdAt = new Date(member.created_at);
            const daysLimit = joinedFilter === "30 hari terakhir" ? 30 : 90;
            const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

            return diffDays <= daysLimit;
         }

         return true;
      });
   }, [members, search, statusFilter, joinedFilter]);

   return (
      <div>
         <div className="admin-card mb-4">
            <div className="row gx-3 gy-3 align-items-end">
               <div className="col-12 col-md-6">
                  <div className="admin-form-group">
                     <label htmlFor="searchMember">Cari anggota</label>
                     <input
                        id="searchMember"
                        className="form-control admin-input"
                        placeholder="Nama atau nomor anggota"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                     />
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="row gx-3 gy-3">
                     <div className="col-12 col-sm-6">
                        <div className="admin-form-group">
                           <label htmlFor="memberStatus">Status</label>
                           <select
                              id="memberStatus"
                              className="form-select admin-input"
                              value={statusFilter}
                              onChange={(event) => setStatusFilter(event.target.value)}
                           >
                              <option>Semua</option>
                              <option>Aktif</option>
                              <option>Nonaktif</option>
                           </select>
                        </div>
                     </div>
                     <div className="col-12 col-sm-6">
                        <div className="admin-form-group">
                           <label htmlFor="memberFilter">Tanggal Bergabung</label>
                           <select
                              id="memberFilter"
                              className="form-select admin-input"
                              value={joinedFilter}
                              onChange={(event) => setJoinedFilter(event.target.value)}
                           >
                              <option>Semua waktu</option>
                              <option>30 hari terakhir</option>
                              <option>90 hari terakhir</option>
                           </select>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="admin-card">
            <h3>Daftar Anggota</h3>
            <div className="table-responsive">
               <table className="admin-table">
                  <thead>
                     <tr>
                        <th>Nomor</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>HP</th>
                        <th>Gabung</th>
                        <th>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredMembers.map((member) => (
                        <tr key={member.id}>
                           <td>{member.member_number}</td>
                           <td>{member.full_name}</td>
                           <td>{member.email || "-"}</td>
                           <td>{member.phone || "-"}</td>
                           <td>{new Date(member.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                           })}</td>
                           <td>
                              <span
                                 className={`admin-status-badge ${member.status ? "approved" : "pending"}`}
                              >
                                 {member.status ? "Aktif" : "Nonaktif"}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
