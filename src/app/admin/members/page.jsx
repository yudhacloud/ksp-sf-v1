"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";
import MembersTable from "@/src/components/admin/member-table/MembersTable";

export default function Page() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/members");

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Gagal mengambil data anggota.");
        }

        const result = await response.json();
        setMembers(result.members || []);
      } catch (err) {
        setError(err?.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  const totalMembers = members.length;
  const activeMembers = members.filter((member) => member.status).length;
  const inactiveMembers = members.filter((member) => !member.status).length;

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Anggota"
        subtitle="Kelola data anggota koperasi dan lihat ringkasan statistik paling penting."
        actions={
          <a href="/admin/members/create" className="btn btn-primary">
            Tambah Anggota
          </a>
        }
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Total Anggota</p>
          <div className="admin-stat-value">{loading ? "-" : totalMembers}</div>
          <p>Anggota terdaftar dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Anggota Aktif</p>
          <div className="admin-stat-value">{loading ? "-" : activeMembers}</div>
          <p>Anggota dengan status aktif.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Anggota Nonaktif</p>
          <div className="admin-stat-value">{loading ? "-" : inactiveMembers}</div>
          <p>Anggota yang menunggu reaktivasi.</p>
        </article>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-muted py-3">Memuat data anggota...</div>
      ) : (
        <MembersTable members={members} />
      )}
    </section>
  );
}
