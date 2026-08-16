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

function formatStatusLabel(status) {
  if (status === "APPROVED") return "Disetujui";
  if (status === "REJECTED") return "Ditolak";
  if (status === "PENDING") return "Menunggu";
  return status || "-";
}

function getActivityBadgeClass(status) {
  if (status === "APPROVED" || status === "Selesai") return "success";
  if (status === "PENDING" || status === "Menunggu") return "pending";
  return "danger";
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState({
    balance: 0,
    loanAmount: 0,
    pendingObligations: 0,
    pendingApplications: 0,
    activities: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [savingsResponse, loansResponse] = await Promise.all([
          fetch("/api/savings/overview"),
          fetch("/api/loans"),
        ]);

        const savingsResult = await savingsResponse.json();
        const loansResult = await loansResponse.json();

        if (!savingsResponse.ok) {
          throw new Error(savingsResult.error || "Gagal memuat data simpanan.");
        }

        if (!loansResponse.ok) {
          throw new Error(loansResult.error || "Gagal memuat data pinjaman.");
        }

        const savingOverview = savingsResult.overview || {};
        const loanApplications = loansResult.applications || [];

        const approvedLoans = loanApplications.filter((loan) => loan.status === "APPROVED");
        const pendingApplications = loanApplications.filter((loan) => loan.status === "PENDING").length;
        const activeLoanAmount = approvedLoans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);

        const obligations = savingOverview.obligations || [];
        const nextDue = obligations.filter((item) => Number(item.remainingAmount || 0) > 0).length;

        const activities = [
          ...((savingOverview.transactions || []).slice(0, 2).map((transaction) => ({
            title: transaction.admin_note || "Transaksi simpanan",
            description: `Nominal ${formatCurrency(transaction.amount)} • ${formatStatusLabel(transaction.status)}`,
            status: transaction.status === "APPROVED" ? "Selesai" : transaction.status === "PENDING" ? "Menunggu" : "Perhatian",
          }))),
          ...((loanApplications || []).slice(0, 2).map((application) => ({
            title: application.loan_product_name || "Pengajuan pinjaman",
            description: `Pengajuan ${formatStatusLabel(application.status)} • ${formatCurrency(application.amount)}`,
            status: application.status === "APPROVED" ? "Selesai" : application.status === "PENDING" ? "Menunggu" : "Perhatian",
          }))),
        ].slice(0, 4);

        if (isMounted) {
          setDashboard({
            balance: Number(savingOverview.balance || 0),
            loanAmount: activeLoanAmount,
            pendingObligations: nextDue,
            pendingApplications,
            activities,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Gagal memuat dashboard.");
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

  const summaryCards = useMemo(
    () => [
      { title: "Saldo Simpanan", value: formatCurrency(dashboard.balance), caption: "Saldo total simpanan yang sudah disetujui." },
      { title: "Pinjaman Aktif", value: formatCurrency(dashboard.loanAmount), caption: "Nominal pinjaman yang masih berjalan." },
      { title: "Cicilan Jatuh Tempo", value: dashboard.pendingObligations, caption: "Tagihan dengan sisa pembayaran yang belum lunas." },
      { title: "Status Pengajuan", value: dashboard.pendingApplications ? `${dashboard.pendingApplications} Pending` : "Tidak ada", caption: "Jumlah pengajuan yang masih menunggu review." },
    ],
    [dashboard],
  );

  return (
    <div className="container py-3">
      <PageHeader
        title="Dashboard Anggota"
        subtitle="Pantau simpanan, pinjaman, dan aktivitas keuangan Anda dalam satu tampilan."
      />

      {error ? (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      ) : null}

      <div className="dashboard-shell">
        <div className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">Status akun Anda</p>
            <h2>Selamat datang di dashboard KSP</h2>
            <p className="mb-0">
              {loading
                ? "Memuat ringkasan data Anda..."
                : `Anda memiliki ${dashboard.pendingApplications || 0} pengajuan pending dan ${dashboard.pendingObligations || 0} tagihan yang belum lunas.`}
            </p>
          </div>
          <div className="dashboard-hero-actions">
            <a className="btn btn-outline-primary" href="/profile">Lihat Profil</a>
            <a className="btn btn-primary" href="/loans/apply">Ajukan Pinjaman</a>
          </div>
        </div>

        <div className="dashboard-stats">
          {summaryCards.map((card) => (
            <article key={card.title} className="dashboard-stat-card">
              <p className="dashboard-stat-title">{card.title}</p>
              <div className="dashboard-stat-value">{card.value}</div>
              <p className="dashboard-stat-caption">{card.caption}</p>
            </article>
          ))}
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Aktivitas Terbaru</h3>
                <p className="text-muted">Riwayat transaksi dan pembaruan akun Anda.</p>
              </div>
            </div>

            <div className="dashboard-list">
              {loading ? (
                <div className="dashboard-list-item">
                  <div>
                    <strong>Memuat data...</strong>
                    <p className="text-muted mb-0">Mohon tunggu sebentar.</p>
                  </div>
                </div>
              ) : dashboard.activities.length === 0 ? (
                <div className="dashboard-list-item">
                  <div>
                    <strong>Belum ada aktivitas</strong>
                    <p className="text-muted mb-0">Data transaksi akan muncul di sini.</p>
                  </div>
                </div>
              ) : (
                dashboard.activities.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="dashboard-list-item">
                    <div>
                      <strong>{item.title}</strong>
                      <p className="text-muted mb-0">{item.description}</p>
                    </div>
                    <span className={`dashboard-pill ${getActivityBadgeClass(item.status)}`}>{item.status}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Aksi Cepat</h3>
                <p className="text-muted">Layanan yang sering Anda butuhkan.</p>
              </div>
            </div>

            <div className="dashboard-quick-list">
              <a href="/savings" className="dashboard-quick-item text-decoration-none text-dark">
                <strong>Riwayat Simpanan</strong>
                <p className="text-muted mb-0">Lihat semua transaksi simpanan Anda.</p>
              </a>
              <a href="/loans" className="dashboard-quick-item text-decoration-none text-dark">
                <strong>Tagihan Cicilan</strong>
                <p className="text-muted mb-0">Cek jatuh tempo dan status pembayaran.</p>
              </a>
              <a href="/profile" className="dashboard-quick-item text-decoration-none text-dark">
                <strong>Profil Anggota</strong>
                <p className="text-muted mb-0">Perbarui data diri dan kontak Anda.</p>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
