"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";
import { toastError, toastSuccess, toastWarning } from "@/src/lib/toast";

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
      return "Disetujui";
    case "REJECTED":
      return "Ditolak";
    default:
      return "Pending";
  }
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPaymentStatus(status) {
  if (status === "PENDING") {
    return "Menunggu verifikasi";
  }

  if (status === "APPROVED") {
    return "Pembayaran disetujui";
  }

  if (status === "REJECTED") {
    return "Pembayaran ditolak";
  }

  return "";
}

function getPaymentHistoryBadgeClass(status) {
  if (status === "APPROVED") {
    return "approved";
  }

  if (status === "REJECTED") {
    return "rejected";
  }

  return "pending";
}

export default function Page() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submittingInstallmentId, setSubmittingInstallmentId] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentNote, setPaymentNote] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const selectedLoan = loans.find((loan) => loan.id === selectedLoanId) || loans[0] || null;
  const nextUnpaidInstallment = useMemo(() => {
    if (!selectedLoan?.loan_detail?.active_installments?.length) {
      return null;
    }

    return selectedLoan.loan_detail.active_installments.find((installment) => installment.status === "PENDING") || null;
  }, [selectedLoan]);
  const selectedInstallment = nextUnpaidInstallment || selectedLoan?.next_installment || null;

  const loadLoans = useCallback(async () => {
    try {
      const response = await fetch("/api/loans");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memuat data pinjaman.");
      }

      const applications = result.applications || [];
      setLoans(applications);
      if (applications.length > 0 && !selectedLoanId) {
        setSelectedLoanId(applications[0].id);
      }
    } catch (error) {
      if (error?.message === "Unauthorized.") {
        setMessage("Silakan login kembali untuk melihat data pinjaman Anda.");
      } else {
        setMessage(error?.message || "Gagal memuat data pinjaman.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadLoans();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadLoans]);

  const activeLoans = useMemo(() => loans.filter((loan) => loan.status === "APPROVED").length, [loans]);
  const pendingApplications = useMemo(() => loans.filter((loan) => loan.status === "PENDING").length, [loans]);
  const hasPendingLoanApplication = useMemo(() => loans.some((loan) => loan.status === "PENDING"), [loans]);
  const hasActiveUnpaidLoan = useMemo(
    () => loans.some((loan) => {
      if (loan.status !== "APPROVED") {
        return false;
      }

      return Number(loan?.loan_detail?.remaining_balance ?? 0) > 0;
    }),
    [loans],
  );
  const isLoanApplicationBlocked = hasPendingLoanApplication || hasActiveUnpaidLoan;
  const totalAmount = useMemo(
    () => loans
      .filter((loan) => loan.status === "APPROVED")
      .reduce((sum, loan) => sum + Number(loan.amount || 0), 0),
    [loans],
  );

  function handleOpenPaymentModal(loan, installment) {
    if (!installment?.id) {
      toastWarning("Tidak ada cicilan yang bisa dibayar saat ini.");
      return;
    }

    if (installment?.is_payment_locked) {
      const statusText = formatPaymentStatus(installment?.latest_payment_status);
      toastWarning(statusText || "Pembayaran cicilan ini tidak bisa diajukan sekarang.");
      return;
    }

    setMessage("");
    setSelectedLoanId(loan.id);
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentNote("");
    setProofFile(null);
    setShowPaymentModal(true);
  }

  function handleClosePaymentModal() {
    if (submittingPayment) {
      return;
    }

    setShowPaymentModal(false);
    setSelectedLoanId(selectedLoanId);
    setProofFile(null);
  }

  async function handleSubmitPayment(event) {
    event.preventDefault();

    if (!selectedInstallment?.id) {
      toastWarning("Data cicilan tidak tersedia.");
      return;
    }

    if (!proofFile) {
      toastWarning("Lampirkan bukti pembayaran terlebih dahulu.");
      return;
    }

    setSubmittingInstallmentId(selectedInstallment.id);
    setSubmittingPayment(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("proof", proofFile);
      formData.append("installmentId", selectedInstallment.id);

      const uploadResponse = await fetch("/api/uploads/installment-proof", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || "Gagal upload bukti pembayaran.");
      }

      const response = await fetch("/api/loans/installments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          installmentId: selectedInstallment.id,
          amount: selectedInstallment.amount_due,
          paymentDate,
          note: paymentNote,
          proofUrl: uploadResult.proofUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim pembayaran cicilan.");
      }

      toastSuccess("Pembayaran cicilan berhasil dikirim dan menunggu verifikasi admin.");
      setShowPaymentModal(false);
      setProofFile(null);
      await loadLoans();
    } catch (error) {
      toastError(error?.message || "Gagal mengirim pembayaran cicilan.");
    } finally {
      setSubmittingInstallmentId(null);
      setSubmittingPayment(false);
    }
  }

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Pinjaman Saya"
        subtitle="Lihat riwayat pengajuan pinjaman dan status pinjaman yang sedang berjalan."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            disabled={isLoanApplicationBlocked}
            title={
              hasPendingLoanApplication
                ? "Masih ada pengajuan pinjaman yang menunggu persetujuan."
                : hasActiveUnpaidLoan
                  ? "Masih ada pinjaman aktif yang belum lunas total."
                  : "Ajukan pinjaman"
            }
            onClick={() => {
              if (!isLoanApplicationBlocked) {
                window.location.href = "/loans/apply";
              }
            }}
          >
            Ajukan Pinjaman
          </button>
        }
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Pinjaman Aktif</p>
          <div className="admin-stat-value">{activeLoans}</div>
          <p>Pinjaman yang sedang berjalan.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Pengajuan Pending</p>
          <div className="admin-stat-value">{pendingApplications}</div>
          <p>Pengajuan yang menunggu review admin.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Total Pinjaman</p>
          <div className="admin-stat-value">{formatCurrency(totalAmount)}</div>
          <p>Jumlah nominal pinjaman yang sudah disetujui.</p>
        </article>
      </div>

      <div className="admin-card">
        <h3>Daftar Produk Pinjaman</h3>
        {loading ? (
          <div className="py-4 text-center text-muted">Memuat data pinjaman...</div>
        ) : message && loans.length === 0 ? (
          <div className="py-4 text-center text-muted">{message}</div>
        ) : loans.length === 0 ? (
          <div className="py-4 text-center text-muted">
            Belum ada data pinjaman. Silakan ajukan pinjaman terlebih dahulu.
          </div>
        ) : (
          <div className="row g-3">
            {loans.map((loan) => (
              <div className="col-12 col-lg-6" key={loan.id}>
                <div
                  className={`border rounded-4 p-3 h-100 cursor-pointer ${selectedLoan?.id === loan.id ? "border-primary bg-light" : "bg-white"}`}
                  onClick={() => setSelectedLoanId(loan.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedLoanId(loan.id);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <div className="small text-muted">Produk</div>
                      <div className="fw-bold fs-5">{loan.loan_product_name || "Pinjaman"}</div>
                    </div>
                    <span className={`admin-status-badge ${loan.status === "APPROVED" ? "approved" : loan.status === "REJECTED" ? "rejected" : "pending"}`}>
                      {formatStatus(loan.status)}
                    </span>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <div className="small text-muted">Nominal</div>
                      <div className="fw-semibold">{formatCurrency(loan.amount)}</div>
                    </div>
                    <div className="col-4">
                      <div className="small text-muted">Tenor</div>
                      <div className="fw-semibold">{loan.tenor} bulan</div>
                    </div>
                    <div className="col-4">
                      <div className="small text-muted">Bunga</div>
                      <div className="fw-semibold">{Number(loan.loan_product_interest_rate || 0).toFixed(2)}%</div>
                    </div>
                  </div>

                  <div className="small text-muted">
                    {loan.status === "APPROVED"
                      ? `Cicilan: ${loan.next_installment ? loan.next_installment.label : "-"}`
                      : loan.status === "REJECTED"
                        ? "Pengajuan pinjaman ditolak"
                        : "Menunggu persetujuan"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedLoan && (
          <div className="mt-4 border rounded-4 p-4 bg-light-subtle">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <div className="small text-muted">Detail Pinjaman</div>
                <h4 className="mb-0">{selectedLoan.loan_product_name || "Pinjaman"}</h4>
              </div>
              <span className={`admin-status-badge ${selectedLoan.status === "APPROVED" ? "approved" : selectedLoan.status === "REJECTED" ? "rejected" : "pending"}`}>
                {formatStatus(selectedLoan.status)}
              </span>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-3">
                <div className="small text-muted">Jumlah Pinjaman</div>
                <div className="fw-bold fs-5">{formatCurrency(selectedLoan.amount)}</div>
              </div>
              <div className="col-12 col-md-3">
                <div className="small text-muted">Suku Bunga</div>
                <div className="fw-bold fs-5">{Number(selectedLoan.loan_product_interest_rate || 0).toFixed(2)}%</div>
              </div>
              <div className="col-12 col-md-3">
                <div className="small text-muted">Jumlah Sudah Dibayar</div>
                <div className="fw-bold fs-5 text-success">
                  {formatCurrency(selectedLoan.loan_detail?.total_paid || 0)}
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="small text-muted">Sisa Pinjaman</div>
                <div className="fw-bold fs-5">
                  {formatCurrency(Math.max(Number(selectedLoan.amount || 0) - Number(selectedLoan.loan_detail?.total_paid || 0), 0))}
                </div>
              </div>
            </div>

            {selectedLoan.status === "APPROVED" && selectedLoan.loan_detail?.active_installments?.length ? (
              <div className="mb-4">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cicilan</th>
                        <th>Jatuh Tempo</th>
                        <th>Nominal</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLoan.loan_detail.active_installments.map((installment) => {
                        const isPayable = installment.id === nextUnpaidInstallment?.id && installment.status === "PENDING";

                        return (
                          <tr key={installment.id}>
                            <td>{`Cicilan ${installment.installment_number}`}</td>
                            <td>{formatDate(installment.due_date)}</td>
                            <td>{formatCurrency(installment.amount_due)}</td>
                            <td>
                              <span className={`admin-status-badge ${installment.status === "PAID" ? "approved" : installment.status === "PENDING" ? "pending" : ""}`}>
                                {installment.status === "PAID" ? "Lunas" : installment.status === "PENDING" ? "Belum Lunas" : installment.status}
                              </span>
                            </td>
                            <td>
                              {isPayable ? (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  disabled={installment.is_payment_locked || submittingInstallmentId === installment.id}
                                  onClick={() => handleOpenPaymentModal(selectedLoan, installment)}
                                >
                                  {submittingInstallmentId === installment.id
                                    ? "Mengirim..."
                                    : installment.is_payment_locked
                                      ? "Sudah Diajukan"
                                      : "Bayar Cicilan"}
                                </button>
                              ) : (
                                <span className="text-muted small">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedLoan.status === "APPROVED" ? (
              <div className="text-muted py-3">Belum ada data cicilan untuk pinjaman ini.</div>
            ) : selectedLoan.status === "REJECTED" ? (
              <div className="text-muted py-3">Pengajuan pinjaman ditolak oleh admin.</div>
            ) : (
              <div className="text-muted py-3">Pinjaman masih menunggu persetujuan admin.</div>
            )}

            {selectedLoan.status === "APPROVED" && selectedLoan.loan_detail?.payment_history?.length ? (
              <div>
                <h5 className="mb-3">Riwayat Pembayaran</h5>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cicilan</th>
                        <th>Tanggal</th>
                        <th>Nominal</th>
                        <th>Status</th>
                        <th>Bukti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLoan.loan_detail.payment_history.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.installment_label || `Cicilan ${payment.installment_number || "-"}`}</td>
                          <td>{formatDate(payment.payment_date || payment.created_at)}</td>
                          <td>{formatCurrency(payment.amount)}</td>
                          <td>
                            <span className={`admin-status-badge ${getPaymentHistoryBadgeClass(payment.status)}`}>
                              {payment.status === "APPROVED"
                                ? "Disetujui"
                                : payment.status === "REJECTED"
                                  ? "Ditolak"
                                  : "Menunggu verifikasi"}
                            </span>
                          </td>
                          <td>
                            {payment.proof_url ? (
                              <a href={payment.proof_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                                Lihat Bukti
                              </a>
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedLoan.status === "APPROVED" ? (
              <div className="mt-4 text-muted py-3">Belum ada riwayat pembayaran untuk pinjaman ini.</div>
            ) : null}
          </div>
        )}

        {message && (
          <div className="alert alert-danger mt-3" role="alert">
            {message}
          </div>
        )}
      </div>

      {showPaymentModal && selectedLoan && selectedInstallment && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Submit Pembayaran Cicilan</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleClosePaymentModal} />
              </div>

              <form onSubmit={handleSubmitPayment}>
                <div className="modal-body">
                  <div className="mb-3">
                    <div className="small text-muted">Produk Pinjaman</div>
                    <div className="fw-semibold">{selectedLoan.loan_product_name || "Pinjaman"}</div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <div className="small text-muted">Cicilan</div>
                      <div className="fw-semibold">{selectedInstallment.label}</div>
                    </div>
                    <div className="col-6">
                      <div className="small text-muted">Jatuh Tempo</div>
                      <div className="fw-semibold">{formatDate(selectedInstallment.due_date)}</div>
                    </div>
                  </div>

                  <div className="mb-3 p-3 border rounded-3 bg-light">
                    <div className="small text-muted">Nominal Pembayaran</div>
                    <div className="h5 mb-0">{formatCurrency(selectedInstallment.amount_due)}</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="paymentDate" className="form-label">Tanggal Pembayaran</label>
                    <input
                      id="paymentDate"
                      type="date"
                      className="form-control"
                      value={paymentDate}
                      onChange={(event) => setPaymentDate(event.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="paymentProof" className="form-label">Upload Bukti Pembayaran</label>
                    <input
                      id="paymentProof"
                      type="file"
                      className="form-control"
                      accept="image/*,.pdf"
                      onChange={(event) => setProofFile(event.target.files?.[0] || null)}
                      required
                    />
                    {proofFile ? <div className="small text-muted mt-2">File terpilih: {proofFile.name}</div> : null}
                  </div>

                  <div className="mb-0">
                    <label htmlFor="paymentNote" className="form-label">Catatan (opsional)</label>
                    <textarea
                      id="paymentNote"
                      className="form-control"
                      rows={3}
                      placeholder="Contoh: transfer BCA a.n. Koperasi"
                      value={paymentNote}
                      onChange={(event) => setPaymentNote(event.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={handleClosePaymentModal} disabled={submittingPayment}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submittingPayment}>
                    {submittingPayment ? "Mengirim..." : "Kirim Pembayaran"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
