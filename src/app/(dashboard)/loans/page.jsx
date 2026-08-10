"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  return "";
}

export default function Page() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submittingInstallmentId, setSubmittingInstallmentId] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentNote, setPaymentNote] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const selectedInstallment = selectedLoan?.next_installment || null;

  const loadLoans = useCallback(async () => {
    try {
      const response = await fetch("/api/loans");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memuat data pinjaman.");
      }

      setLoans(result.applications || []);
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
  const totalAmount = useMemo(
    () => loans
      .filter((loan) => loan.status === "APPROVED")
      .reduce((sum, loan) => sum + Number(loan.amount || 0), 0),
    [loans],
  );

  function handleOpenPaymentModal(loan) {
    if (!loan?.next_installment?.id) {
      setMessage("Tidak ada cicilan yang bisa dibayar saat ini.");
      return;
    }

    if (loan.next_installment?.is_payment_locked) {
      const statusText = formatPaymentStatus(loan.next_installment?.latest_payment_status);
      setMessage(statusText || "Pembayaran cicilan ini tidak bisa diajukan sekarang.");
      return;
    }

    setMessage("");
    setSelectedLoan(loan);
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
    setSelectedLoan(null);
    setProofFile(null);
  }

  async function handleSubmitPayment(event) {
    event.preventDefault();

    if (!selectedInstallment?.id) {
      setMessage("Data cicilan tidak tersedia.");
      return;
    }

    if (!proofFile) {
      setMessage("Lampirkan bukti pembayaran terlebih dahulu.");
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

      setMessage("Pembayaran cicilan berhasil dikirim dan menunggu verifikasi admin.");
      setShowPaymentModal(false);
      setSelectedLoan(null);
      setProofFile(null);
      await loadLoans();
    } catch (error) {
      setMessage(error?.message || "Gagal mengirim pembayaran cicilan.");
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
          <a href="/loans/apply" className="btn btn-primary">
            Ajukan Pinjaman
          </a>
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
        <h3>Daftar Pinjaman</h3>
        {loading ? (
          <div className="py-4 text-center text-muted">Memuat data pinjaman...</div>
        ) : message && loans.length === 0 ? (
          <div className="py-4 text-center text-muted">{message}</div>
        ) : loans.length === 0 ? (
          <div className="py-4 text-center text-muted">
            Belum ada data pinjaman. Silakan ajukan pinjaman terlebih dahulu.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Nominal</th>
                  <th>Tenor</th>
                  <th>Status</th>
                  <th>Cicilan Berikutnya</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Belum ada data pinjaman.
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.loan_product_name || loan.loan_products?.name || "Pinjaman"}</td>
                      <td>{formatCurrency(loan.amount)}</td>
                      <td>{loan.tenor} bulan</td>
                      <td>
                        <span className={`admin-status-badge ${loan.status === "APPROVED" ? "approved" : "pending"}`}>
                          {formatStatus(loan.status)}
                        </span>
                      </td>
                      <td>
                        {loan.status === "APPROVED" && loan.next_installment ? (
                          <div>
                            <div className="fw-semibold">{loan.next_installment.label}</div>
                            <div className="text-muted small">
                              {formatDate(loan.next_installment.due_date)}
                            </div>
                          </div>
                        ) : loan.status === "APPROVED" ? (
                          "Belum ada jadwal"
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {loan.status === "APPROVED" ? (
                          <div className="d-flex flex-column gap-2">
                            <div className="small text-muted">
                              {loan.next_installment?.amount_due ? formatCurrency(loan.next_installment.amount_due) : "-"}
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              disabled={!loan.next_installment?.id || loan.next_installment?.is_payment_locked || submittingInstallmentId === loan.next_installment.id}
                              onClick={() => handleOpenPaymentModal(loan)}
                            >
                              {submittingInstallmentId === loan.next_installment.id
                                ? "Mengirim..."
                                : loan.next_installment?.is_payment_locked
                                  ? "Sudah Diajukan"
                                  : "Bayar Cicilan"}
                            </button>
                            {loan.next_installment?.is_payment_locked ? (
                              <div className="small text-muted">
                                {formatPaymentStatus(loan.next_installment?.latest_payment_status)}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          "-"
                        )}
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
