import PageHeader from "@/src/components/ui/PageHeader";
import MembersTable from "@/src/components/admin/MembersTable";

async function getMembers() {
  // Fetch data dari API server-side pada saat render halaman.
  // Gunakan URL absolut agar `fetch` server-side tidak gagal dengan path relatif.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/admin/members`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Gagal mengambil data anggota.");
  }

  const result = await response.json();
  return result.members || [];
}

export default async function Page() {
  const members = await getMembers();
  const totalMembers = members.length;
  const activeMembers = members.filter((member) => member.status).length;
  const inactiveMembers = members.filter((member) => !member.status).length;

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Anggota"
        subtitle="Kelola data anggota koperasi dan lihat ringkasan statistik paling penting."
        actions={<button className="btn btn-primary">Tambah Anggota</button>}
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Total Anggota</p>
          <div className="admin-stat-value">{totalMembers}</div>
          <p>Anggota terdaftar dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Anggota Aktif</p>
          <div className="admin-stat-value">{activeMembers}</div>
          <p>Anggota dengan status aktif.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Anggota Nonaktif</p>
          <div className="admin-stat-value">{inactiveMembers}</div>
          <p>Anggota yang menunggu reaktivasi.</p>
        </article>
      </div>

      <MembersTable members={members} />
    </section>
  );
}
