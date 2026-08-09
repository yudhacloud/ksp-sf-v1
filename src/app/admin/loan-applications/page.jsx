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

function formatStatus(status) {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return "Pending";
  }
}

export default function Page() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch("/api/admin/loan-applications");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat data pengajuan pinjaman.");
        }

        setApplications(result.applications || []);
      } catch (error) {
        setMessage(error?.message || "Gagal memuat data pengajuan pinjaman.");
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  const stats = useMemo(() => {
    return {
      pending: applications.filter((application) => application.status === "PENDING").length,
      approved: applications.filter((application) => application.status === "APPROVED").length,
      rejected: applications.filter((application) => application.status === "REJECTED").length,
    };
  }, [applications]);

  async function handleReview(applicationId, status) {
    const note = noteDrafts[applicationId] || "";

    if (status === "REJECTED" && !note.trim()) {
      setMessage("Catatan penolakan wajib diisi.");
      return;
    }

    try {
      setProcessingId(applicationId);
      const response = await fetch(`/api/admin/loan-applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_note: note }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui status pengajuan.");
      }

      setApplications((current) =>
        current.map((application) => (application.id === applicationId ? result.application : application))
      );
      setMessage("");
      setNoteDrafts((current) => ({ ...current, [applicationId]: "" }));
    } catch (error) {
      setMessage(error?.message || "Gagal memperbarui status pengajuan.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Pengajuan Pinjaman"
        subtitle="Review, setujui, atau tolak pengajuan pinjaman anggota dengan catatan admin."
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Pending</p>
          <div className="admin-stat-value">{stats.pending}</div>
          <p>Pengajuan menunggu persetujuan.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Approved</p>
          <div className="admin-stat-value">{stats.approved}</div>
          <p>Pengajuan yang telah disetujui.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Rejected</p>
          <div className="admin-stat-value">{stats.rejected}</div>
          <p>Pengajuan yang ditolak.</p>
        </article>
      </div>

      <div className="admin-card">
        <h3>Daftar Pengajuan</h3>
        {loading ? (
          <div className="py-4 text-center text-muted">Memuat data pengajuan...</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Anggota</th>
                  <th>Produk</th>
                  <th>Nominal</th>
                  <th>Tenor</th>
                  <th>Tujuan</th>
                  <th>Catatan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Belum ada pengajuan pinjaman.
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.member_name || application.member?.full_name || "-"}</td>
                      <td>{application.loan_product_name || application.loan_products?.name || "-"}</td>
                      <td>{formatCurrency(application.amount)}</td>
                      <td>{application.tenor} bulan</td>
                      <td>{application.purpose || "-"}</td>
                      <td>
                        <textarea
                          className="form-control form-control-sm"
                          rows="2"
                          value={noteDrafts[application.id] ?? application.admin_note ?? ""}
                          onChange={(event) =>
                            setNoteDrafts((current) => ({ ...current, [application.id]: event.target.value }))
                          }
                          placeholder="Catatan admin"
                          disabled={application.status !== "PENDING"}
                        />
                      </td>
                      <td>
                        <span className={`admin-status-badge ${application.status === "APPROVED" ? "approved" : application.status === "REJECTED" ? "rejected" : "pending"}`}>
                          {formatStatus(application.status)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            title="Approve"
                            onClick={() => handleReview(application.id, "APPROVED")}
                            disabled={processingId === application.id || application.status !== "PENDING"}
                          >
                            {processingId === application.id ? "..." : <i className="bi bi-check-circle"></i>}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Tolak"
                            onClick={() => handleReview(application.id, "REJECTED")}
                            disabled={processingId === application.id || application.status !== "PENDING"}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {message && (
          <div className="alert alert-danger mt-3" role="alert">
            {message}
          </div>
        )}
      </div>
    </section>
  );
}
