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

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState({
    members: [],
    applications: [],
    monitoring: [],
    transactions: [],
    loans: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      try {
        setLoading(true);
        setError("");

        const [membersResponse, applicationsResponse, monitoringResponse, transactionsResponse, loansResponse] = await Promise.all([
          fetch("/api/admin/members"),
          fetch("/api/admin/loan-applications"),
          fetch("/api/admin/saving-monitoring"),
          fetch("/api/admin/saving-transactions"),
          fetch("/api/admin/loans"),
        ]);

        const membersResult = await membersResponse.json();
        const applicationsResult = await applicationsResponse.json();
        const monitoringResult = await monitoringResponse.json();
        const transactionsResult = await transactionsResponse.json();
        const loansResult = await loansResponse.json();

        if (!membersResponse.ok) {
          throw new Error(membersResult.error || "Gagal memuat data anggota.");
        }
        if (!applicationsResponse.ok) {
          throw new Error(applicationsResult.error || "Gagal memuat data pengajuan.");
        }
        if (!monitoringResponse.ok) {
          throw new Error(monitoringResult.error || "Gagal memuat data monitoring simpanan.");
        }
        if (!transactionsResponse.ok) {
          throw new Error(transactionsResult.error || "Gagal memuat data transaksi simpanan.");
        }
        if (!loansResponse.ok) {
          throw new Error(loansResult.error || "Gagal memuat data pinjaman aktif.");
        }

        if (isMounted) {
          setReport({
            members: membersResult.members || [],
            applications: applicationsResult.applications || [],
            monitoring: monitoringResult.saving_monitoring || [],
            transactions: transactionsResult.saving_transactions || [],
            loans: loansResult.loans || [],
          });
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.message || "Gagal memuat laporan.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const members = report.members || [];
    const applications = report.applications || [];
    const monitoring = report.monitoring || [];
    const transactions = report.transactions || [];
    const loans = report.loans || [];

    const approvedTransactions = transactions.filter((item) => item.status === "APPROVED");
    const pendingApplications = applications.filter((item) => item.status === "PENDING");
    const pendingTransactions = transactions.filter((item) => item.status === "PENDING");
    const activeMembers = members.filter((member) => member.status === true || member.status === "true");

    const totalSavings = monitoring.reduce((sum, item) => sum + Number(item.amount_due || 0), 0);
    const totalLoanPrincipal = loans.reduce((sum, item) => sum + Number(item.principal || 0), 0);
    const totalApprovedSavings = approvedTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalOutstandingBalance = loans.reduce((sum, item) => sum + Number(item.remaining || 0), 0);

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      totalSavings,
      totalLoanPrincipal,
      totalApprovedSavings,
      totalOutstandingBalance,
      pendingApplications: pendingApplications.length,
      pendingTransactions: pendingTransactions.length,
      approvedLoans: applications.filter((item) => item.status === "APPROVED").length,
      rejectedLoans: applications.filter((item) => item.status === "REJECTED").length,
      overdueObligations: monitoring.filter((item) => item.calculated_status === "OVERDUE").length,
      partialObligations: monitoring.filter((item) => item.calculated_status === "PARTIAL").length,
    };
  }, [report]);

  const statusBreakdown = useMemo(() => {
    const applications = report.applications || [];
    return [
      { label: "Pending", value: applications.filter((item) => item.status === "PENDING").length, tone: "warning" },
      { label: "Approved", value: applications.filter((item) => item.status === "APPROVED").length, tone: "success" },
      { label: "Rejected", value: applications.filter((item) => item.status === "REJECTED").length, tone: "danger" },
    ];
  }, [report.applications]);

  const exportReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      summary,
      statuses: statusBreakdown,
      membersCount: report.members.length,
      loanApplicationsCount: report.applications.length,
      monitoringCount: report.monitoring.length,
      transactionsCount: report.transactions.length,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "laporan-koperasi.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Laporan"
        subtitle="Pantau performa koperasi, total simpanan, pinjaman aktif, dan item yang perlu perhatian admin."
        actions={
          <button type="button" className="btn btn-primary" onClick={exportReport}>
            Ekspor Laporan
          </button>
        }
      />

      {error ? (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Total Anggota</p>
          <div className="admin-stat-value">{loading ? "--" : summary.totalMembers}</div>
          <p>Anggota yang sudah terdaftar.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Simpanan</p>
          <div className="admin-stat-value">{loading ? "--" : formatCurrency(summary.totalSavings)}</div>
          <p>Nilai tagihan simpanan aktif.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Pinjaman Aktif</p>
          <div className="admin-stat-value">{loading ? "--" : formatCurrency(summary.totalLoanPrincipal)}</div>
          <p>Nilai pokok pinjaman yang berjalan.</p>
        </article>
      </div>

      <div className="admin-card mb-4">
        <h3 className="mb-3">Ringkasan Operasional</h3>

        {loading ? (
          <div className="text-muted py-3">Memuat ringkasan laporan...</div>
        ) : (
          <div className="row g-3">
            <div className="col-12 col-md-6 col-xl-3">
              <div className="border rounded-4 p-3 h-100">
                <div className="small text-muted">Anggota aktif</div>
                <div className="fs-4 fw-semibold">{summary.activeMembers}</div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="border rounded-4 p-3 h-100">
                <div className="small text-muted">Pengajuan pending</div>
                <div className="fs-4 fw-semibold">{summary.pendingApplications}</div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="border rounded-4 p-3 h-100">
                <div className="small text-muted">Transaksi pending</div>
                <div className="fs-4 fw-semibold">{summary.pendingTransactions}</div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="border rounded-4 p-3 h-100">
                <div className="small text-muted">Sisa saldo pinjaman</div>
                <div className="fs-4 fw-semibold">{formatCurrency(summary.totalOutstandingBalance)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="admin-card mb-4">
        <h3 className="mb-3">Status Pengajuan Pinjaman</h3>

        {loading ? (
          <div className="text-muted py-3">Memuat status pengajuan...</div>
        ) : (
          <div className="row g-3">
            {statusBreakdown.map((item) => (
              <div key={item.label} className="col-12 col-md-4">
                <div className={`border rounded-4 p-3 h-100 bg-${item.tone}-subtle`}>
                  <div className="small text-muted">{item.label}</div>
                  <div className="fs-3 fw-semibold">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card mb-4">
        <h3 className="mb-3">Monitoring Tagihan Simpanan</h3>

        {loading ? (
          <div className="text-muted py-3">Memuat data tagihan...</div>
        ) : (
          <div className="row g-3">
            <div className="col-12 col-md-6 col-xl-3">
              <div className="border rounded-4 p-3 h-100">
                <div className="small text-muted">Tagihan overdue</div>
                <div className="fs-4 fw-semibold">{summary.overdueObligations}</div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="border rounded-4 p-3 h-100">
                <div className="small text-muted">Tagihan parsial</div>
                <div className="fs-4 fw-semibold">{summary.partialObligations}</div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="border rounded-4 p-3 h-100">
                <div className="small text-muted">Transaksi disetujui</div>
                <div className="fs-4 fw-semibold">{formatCurrency(summary.totalApprovedSavings)}</div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="border rounded-4 p-3 h-100">
                <div className="small text-muted">Pinjaman disetujui</div>
                <div className="fs-4 fw-semibold">{summary.approvedLoans}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="admin-card">
        <h3 className="mb-3">Data Terbaru</h3>

        {loading ? (
          <div className="text-muted py-3">Mengambil data laporan terbaru...</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Jenis</th>
                  <th>Jumlah</th>
                  <th>Nilai</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Anggota</td>
                  <td>{summary.totalMembers}</td>
                  <td>-</td>
                  <td>Terdaftar di sistem</td>
                </tr>
                <tr>
                  <td>Pengajuan pinjaman</td>
                  <td>{report.applications.length}</td>
                  <td>{formatCurrency(report.applications.reduce((sum, item) => sum + Number(item.amount || 0), 0))}</td>
                  <td>{summary.pendingApplications} menunggu review</td>
                </tr>
                <tr>
                  <td>Monitoring simpanan</td>
                  <td>{report.monitoring.length}</td>
                  <td>{formatCurrency(summary.totalSavings)}</td>
                  <td>{summary.overdueObligations} overdue</td>
                </tr>
                <tr>
                  <td>Transaksi simpanan</td>
                  <td>{report.transactions.length}</td>
                  <td>{formatCurrency(summary.totalApprovedSavings)}</td>
                  <td>{summary.pendingTransactions} menunggu verifikasi</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
