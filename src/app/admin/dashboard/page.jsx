"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getBadgeClass(status) {
  if (status === "APPROVED" || status === "Lunas" || status === "Siap") return "success";
  if (status === "PENDING" || status === "Menunggu") return "pending";
  return "danger";
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalSavings: 0,
    activeLoans: 0,
    pendingApplications: 0,
    reviewItems: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [membersResponse, loanApplicationsResponse, monitoringResponse] = await Promise.all([
          fetch("/api/admin/members"),
          fetch("/api/admin/loan-applications"),
          fetch("/api/admin/saving-monitoring"),
        ]);

        const membersResult = await membersResponse.json();
        const applicationsResult = await loanApplicationsResponse.json();
        const monitoringResult = await monitoringResponse.json();

        if (!membersResponse.ok) {
          throw new Error(membersResult.error || "Gagal memuat data anggota.");
        }

        if (!loanApplicationsResponse.ok) {
          throw new Error(applicationsResult.error || "Gagal memuat data pengajuan.");
        }

        if (!monitoringResponse.ok) {
          throw new Error(monitoringResult.error || "Gagal memuat data monitoring simpanan.");
        }

        const members = membersResult.members || [];
        const applications = applicationsResult.applications || [];
        const monitoring = monitoringResult.saving_monitoring || [];

        const pendingApplications = applications.filter((item) => item.status === "PENDING").length;
        const totalSavings = monitoring.reduce((sum, item) => sum + Number(item.amount_due || 0), 0);

        const reviewItems = [
          {
            title: "Pengajuan pinjaman baru",
            description: `${pendingApplications} permohonan menunggu review admin.`,
            status: pendingApplications > 0 ? "PENDING" : "Siap",
          },
          {
            title: "Tagihan simpanan",
            description: `${monitoring.filter((item) => item.calculated_status === "PENDING" || item.calculated_status === "OVERDUE").length} tagihan menunggu perhatian.`,
            status: monitoring.some((item) => item.calculated_status === "OVERDUE") ? "danger" : "PENDING",
          },
          {
            title: "Konfirmasi simpanan",
            description: `${monitoring.filter((item) => item.calculated_status === "PARTIAL").length} rekening masih perlu diverifikasi.`,
            status: "PENDING",
          },
        ];

        if (isMounted) {
          setDashboard({
            totalMembers: members.length,
            activeMembers: members.filter((member) => member.status).length,
            totalSavings,
            activeLoans: applications.filter((item) => item.status === "APPROVED").length,
            pendingApplications,
            reviewItems,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Gagal memuat dashboard admin.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { title: "Total Anggota", value: dashboard.totalMembers, caption: "Anggota terdaftar dalam sistem." },
      { title: "Total Simpanan", value: formatCurrency(dashboard.totalSavings), caption: "Nilai tagihan simpanan terdata." },
      { title: "Pinjaman Aktif", value: dashboard.activeLoans, caption: "Jumlah pinjaman yang sedang berjalan." },
      { title: "Tunggakan", value: dashboard.pendingApplications, caption: "Item yang membutuhkan review admin." },
    ],
    [dashboard],
  );

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Pantau kondisi koperasi, review pengajuan pinjaman, dan tindaklanjuti aktivitas harian dengan cepat."
        actions={
          <div className="d-flex gap-2">
            <a className="btn btn-outline-primary" href="/admin/loan-applications">Review Pinjaman</a>
            <a className="btn btn-primary" href="/admin/saving-monitoring">Monitoring Simpanan</a>
          </div>
        }
      />

      {error ? (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      ) : null}

      <div className="dashboard-shell">
        <div className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">Operasional hari ini</p>
            <h2>Ringkasan kinerja koperasi</h2>
            <p className="mb-0">
              {loading
                ? "Memuat ringkasan data koperasi..."
                : `Ada ${dashboard.pendingApplications || 0} pengajuan menunggu review dan ${dashboard.activeMembers || 0} anggota aktif.`}
            </p>
          </div>
          <div className="dashboard-hero-actions">
            <a className="btn btn-outline-primary" href="/admin/loan-applications">Review Pinjaman</a>
            <a className="btn btn-primary" href="/admin/notifications">Approval Center</a>
          </div>
        </div>

        <div className="dashboard-stats">
          {stats.map((item) => (
            <article key={item.title} className="dashboard-stat-card">
              <p className="dashboard-stat-title">{item.title}</p>
              <div className="dashboard-stat-value">{item.value}</div>
              <p className="dashboard-stat-caption">{item.caption}</p>
            </article>
          ))}
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Approval Center</h3>
                <p className="text-muted">Daftar kebutuhan tindakan yang paling mendesak.</p>
              </div>
              <a className="btn btn-outline-primary btn-sm" href="/admin/loan-applications">Lihat Semua</a>
            </div>

            <div className="dashboard-list">
              {loading ? (
                <div className="dashboard-list-item">
                  <div>
                    <strong>Memuat data...</strong>
                    <p className="text-muted mb-0">Mohon tunggu sebentar.</p>
                  </div>
                </div>
              ) : dashboard.reviewItems.length === 0 ? (
                <div className="dashboard-list-item">
                  <div>
                    <strong>Belum ada item review</strong>
                    <p className="text-muted mb-0">Semua pekerjaan sudah selesai.</p>
                  </div>
                </div>
              ) : (
                dashboard.reviewItems.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="dashboard-list-item">
                    <div>
                      <strong>{item.title}</strong>
                      <p className="text-muted mb-0">{item.description}</p>
                    </div>
                    <span className={`dashboard-pill ${getBadgeClass(item.status)}`}>{item.status === "PENDING" ? "Pending" : item.status === "danger" ? "Perhatian" : "Siap"}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Aksi Cepat</h3>
                <p className="text-muted">Langkah yang sering dipakai admin.</p>
              </div>
            </div>

            <div className="dashboard-quick-list">
              <a href="/admin/members" className="dashboard-quick-item text-decoration-none text-dark">
                <strong>Kelola Anggota</strong>
                <p className="text-muted mb-0">Tambah data anggota dan lihat status akun.</p>
              </a>
              <a href="/admin/loan-applications" className="dashboard-quick-item text-decoration-none text-dark">
                <strong>Review Pengajuan</strong>
                <p className="text-muted mb-0">Setujui atau tolak permohonan anggota.</p>
              </a>
              <a href="/admin/saving-monitoring" className="dashboard-quick-item text-decoration-none text-dark">
                <strong>Monitoring Cicilan</strong>
                <p className="text-muted mb-0">Pantau pembayaran dan tunggakan simpanan.</p>
              </a>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
