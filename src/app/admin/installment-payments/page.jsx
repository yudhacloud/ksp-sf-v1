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

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function normalizeStatus(status) {
  if (status === "PAID") return "Lunas";
  if (status === "OVERDUE") return "Terlambat";
  return "Belum Dibayar";
}

function getStatusClass(status) {
  if (status === "PAID") return "approved";
  if (status === "OVERDUE") return "rejected";
  return "pending";
}

function getPaymentStatusLabel(status) {
  if (status === "APPROVED") return "Disetujui";
  if (status === "REJECTED") return "Ditolak";
  return "Menunggu verifikasi";
}

function getPaymentStatusClass(status) {
  if (status === "APPROVED") return "approved";
  if (status === "REJECTED") return "rejected";
  return "pending";
}

function getMemberStatusClass(member) {
  const overdueCount = member.installments.filter((item) => {
    if (item.status === "PAID") return false;
    if (!item.due_date) return false;
    const dueDate = new Date(item.due_date);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  const unpaidCount = member.installments.filter((item) => item.status !== "PAID").length;

  if (overdueCount > 0) return "rejected";
  if (unpaidCount === 0) return "approved";
  return "pending";
}

export default function Page() {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  const loadInstallments = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/installment-payments");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memuat data pembayaran cicilan.");
      }

      setInstallments(result.installments || []);
      setMessage("");
    } catch (error) {
      setMessage(error?.message || "Gagal memuat data pembayaran cicilan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInstallments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadInstallments]);

  async function handleUpdatePayment(payment, nextStatus) {
    if (!payment?.payment_id) {
      setMessage("Belum ada bukti pembayaran untuk cicilan ini.");
      return;
    }

    if (payment.latest_payment_status && payment.latest_payment_status !== "PENDING") {
      setMessage("Aksi hanya tersedia untuk pembayaran yang masih menunggu verifikasi.");
      return;
    }

    let adminNote = "";
    if (nextStatus === "REJECTED") {
      const note = window.prompt("Masukkan alasan penolakan pembayaran cicilan", payment.latest_payment_admin_note || "");
      if (note === null) {
        return;
      }

      adminNote = note.trim();
      if (!adminNote) {
        setMessage("Alasan penolakan wajib diisi.");
        return;
      }
    }

    const actionText = nextStatus === "APPROVED" ? "menyetujui" : "menolak";
    const confirmed = window.confirm(`Yakin ${actionText} pembayaran untuk ${payment.installment_label || "cicilan ini"}?`);

    if (!confirmed) {
      return;
    }

    setUpdatingPaymentId(payment.payment_id);

    try {
      const response = await fetch(`/api/admin/installment-payments/${payment.payment_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          admin_note: adminNote,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui status pembayaran cicilan.");
      }

      await loadInstallments();
    } catch (error) {
      setMessage(error?.message || "Gagal memperbarui status pembayaran cicilan.");
    } finally {
      setUpdatingPaymentId(null);
    }
  }

  const groupedMembers = useMemo(() => {
    const grouped = installments.reduce((acc, item) => {
      const memberId = item.member_id || "unknown";
      if (!acc[memberId]) {
        acc[memberId] = {
          id: memberId,
          memberName: item.member_name || "Anggota",
          installments: [],
        };
      }

      acc[memberId].installments.push(item);
      return acc;
    }, {});

    return Object.values(grouped);
  }, [installments]);

  const normalizedMembers = useMemo(() => groupedMembers, [groupedMembers]);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return normalizedMembers.filter((member) => {
      if (!normalizedSearch) return true;
      return (
        member.memberName.toLowerCase().includes(normalizedSearch) ||
        member.installments.some((item) => item.installment_label?.toLowerCase().includes(normalizedSearch))
      );
    });
  }, [normalizedMembers, search]);

  const selectedMember = useMemo(
    () => filteredMembers.find((member) => member.id === selectedMemberId) ?? filteredMembers[0] ?? null,
    [filteredMembers, selectedMemberId],
  );

  function openPaymentDetail(payment) {
    setSelectedPayment(payment);
  }

  function closePaymentDetail() {
    setSelectedPayment(null);
  }

  const stats = useMemo(() => {
    const totalTagihan = installments.reduce((sum, item) => sum + Number(item.amount_due || 0), 0);
    const totalBelumDibayar = installments
      .filter((item) => item.status !== "PAID")
      .reduce((sum, item) => sum + Number(item.amount_due || 0), 0);
    const totalSudahDibayar = installments
      .filter((item) => item.status === "PAID")
      .reduce((sum, item) => sum + Number(item.amount_due || 0), 0);
    const anggotaBermasalah = groupedMembers.filter((member) => member.installments.some((item) => item.status !== "PAID")).length;

    return {
      totalTagihan,
      totalBelumDibayar,
      totalSudahDibayar,
      anggotaBermasalah,
    };
  }, [installments, groupedMembers]);

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Pembayaran Cicilan"
        subtitle="Verifikasi pembayaran cicilan dan pantau tunggakan anggota dengan tampilan yang lebih mudah dibaca."
      />

      <div className="admin-grid mb-4">
        <article className="admin-card compact-stat-card">
          <p className="admin-stat-title">Total Tagihan</p>
          <div className="admin-stat-value">{formatCurrency(stats.totalTagihan)}</div>
          <p>Jumlah total nominal cicilan yang sedang dipantau.</p>
        </article>
        <article className="admin-card compact-stat-card">
          <p className="admin-stat-title">Belum Dibayar</p>
          <div className="admin-stat-value">{formatCurrency(stats.totalBelumDibayar)}</div>
          <p>Nilai cicilan yang belum lunas.</p>
        </article>
        <article className="admin-card compact-stat-card">
          <p className="admin-stat-title">Anggota Bermasalah</p>
          <div className="admin-stat-value">{stats.anggotaBermasalah}</div>
          <p>Jumlah anggota yang memiliki cicilan belum lunas.</p>
        </article>
      </div>

      <div className="admin-card mb-4">
        <div className="admin-form-group">
          <label htmlFor="searchInstallment">Cari Anggota</label>
          <input
            id="searchInstallment"
            className="form-control admin-input"
            placeholder="Nama anggota atau cicilan"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="admin-card h-100">
            <h3>Daftar Anggota</h3>
            <p className="text-muted mb-3">Klik anggota untuk melihat detail cicilan per bulan.</p>
            <div className="d-grid gap-2">
              {loading ? (
                <div className="text-muted">Memuat data cicilan...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-muted">Tidak ada anggota yang sesuai pencarian.</div>
              ) : (
                filteredMembers.map((member) => {
                  const unpaidCount = member.installments.filter((item) => item.status !== "PAID").length;

                  return (
                    <button
                      key={member.id}
                      type="button"
                      className={`btn btn-outline-primary text-start w-100 ${selectedMember?.id === member.id ? "active" : ""}`}
                      onClick={() => setSelectedMemberId(member.id)}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{member.memberName}</div>
                          <div className="small text-muted">{member.installments.length} cicilan</div>
                          <div className="mt-3">
                            <span className={`admin-status-badge ${getMemberStatusClass(member)}`}>
                              {(() => {
                                const overdueCount = member.installments.filter((item) => {
                                  if (item.status === "PAID") return false;
                                  if (!item.due_date) return false;
                                  const dueDate = new Date(item.due_date);
                                  const today = new Date();
                                  dueDate.setHours(0, 0, 0, 0);
                                  today.setHours(0, 0, 0, 0);
                                  return dueDate < today;
                                }).length;

                                if (overdueCount > 0) return `${overdueCount} terlambat`;
                                if (unpaidCount === 0) return "Lancar";
                                return `${unpaidCount} belum lunas`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="admin-card h-100">
            {selectedMember ? (
              <>
                <div className="d-flex justify-content-between flex-wrap gap-2 align-items-start mb-4">
                  <div>
                    <h3>{selectedMember.memberName}</h3>
                    <p className="text-muted">{selectedMember.installments.length} cicilan terdaftar</p>
                  </div>
                  <span className={`admin-status-badge ${getMemberStatusClass(selectedMember)}`}>
                    {(() => {
                      const overdueCount = selectedMember.installments.filter((item) => {
                        if (item.status === "PAID") return false;
                        if (!item.due_date) return false;
                        const dueDate = new Date(item.due_date);
                        const today = new Date();
                        dueDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);
                        return dueDate < today;
                      }).length;

                      if (overdueCount > 0) return `${overdueCount} terlambat`;
                      if (selectedMember.installments.filter((item) => item.status !== "PAID").length === 0) return "Lancar";
                      return `${selectedMember.installments.filter((item) => item.status !== "PAID").length} belum lunas`;
                    })()}
                  </span>
                </div>

                <div className="admin-grid mb-4">
                  <article className="admin-card compact-stat-card">
                    <p className="admin-stat-title">Total Tagihan</p>
                    <div className="admin-stat-value">
                      {formatCurrency(selectedMember.installments.reduce((sum, item) => sum + Number(item.amount_due || 0), 0))}
                    </div>
                    <p>Keseluruhan tagihan anggota ini.</p>
                  </article>
                  <article className="admin-card compact-stat-card">
                    <p className="admin-stat-title">Sudah Dibayar</p>
                    <div className="admin-stat-value">
                      {formatCurrency(selectedMember.installments.filter((item) => item.status === "PAID").reduce((sum, item) => sum + Number(item.amount_due || 0), 0))}
                    </div>
                    <p>Nominal cicilan yang sudah lunas.</p>
                  </article>
                  <article className="admin-card compact-stat-card">
                    <p className="admin-stat-title">Sisa Belum Bayar</p>
                    <div className="admin-stat-value">
                      {formatCurrency(selectedMember.installments.filter((item) => item.status !== "PAID").reduce((sum, item) => sum + Number(item.amount_due || 0), 0))}
                    </div>
                    <p>Nominal tunggakan yang masih belum dibayar.</p>
                  </article>
                </div>

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
                      {selectedMember.installments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.installment_label}</td>
                          <td>{formatDate(payment.due_date)}</td>
                          <td>{formatCurrency(payment.amount_due)}</td>
                          <td>
                            {payment.payment_id ? (
                              <span className={`admin-status-badge ${getPaymentStatusClass(payment.latest_payment_status)}`}>
                                {getPaymentStatusLabel(payment.latest_payment_status)}
                              </span>
                            ) : (
                              <span className="admin-status-badge pending">Belum ada pembayaran</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openPaymentDetail(payment)}
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-muted">Pilih anggota untuk melihat detail cicilan.</div>
            )}
          </div>
        </div>
      </div>

      {selectedPayment && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Cicilan</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closePaymentDetail} />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <div className="small text-muted">Anggota</div>
                  <div className="fw-semibold">{selectedMember?.memberName || "Anggota"}</div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="small text-muted">Cicilan</div>
                    <div className="fw-semibold">{selectedPayment.installment_label}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted">Jatuh Tempo</div>
                    <div className="fw-semibold">{formatDate(selectedPayment.due_date)}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small text-muted">Nominal</div>
                  <div className="fw-semibold">{formatCurrency(selectedPayment.amount_due)}</div>
                </div>

                <div className="mb-3">
                  <div className="small text-muted">Status Cicilan</div>
                  <span className={`admin-status-badge ${getStatusClass(selectedPayment.status)}`}>
                    {normalizeStatus(selectedPayment.status)}
                  </span>
                </div>

                {selectedPayment.payment_id ? (
                  <>
                    <div className="mb-3">
                      <div className="small text-muted">Status Pembayaran</div>
                      <span className={`admin-status-badge ${getPaymentStatusClass(selectedPayment.latest_payment_status)}`}>
                        {getPaymentStatusLabel(selectedPayment.latest_payment_status)}
                      </span>
                    </div>

                    {selectedPayment.latest_payment_date ? (
                      <div className="mb-3">
                        <div className="small text-muted">Tanggal Pembayaran</div>
                        <div className="fw-semibold">{formatDate(selectedPayment.latest_payment_date)}</div>
                      </div>
                    ) : null}

                    {selectedPayment.latest_payment_amount ? (
                      <div className="mb-3">
                        <div className="small text-muted">Nominal Pembayaran</div>
                        <div className="fw-semibold">{formatCurrency(selectedPayment.latest_payment_amount)}</div>
                      </div>
                    ) : null}

                    {selectedPayment.latest_payment_proof_url ? (
                      <div className="mb-3">
                        <div className="small text-muted mb-2">Bukti Pembayaran</div>
                        <div className="border rounded-4 overflow-hidden bg-light">
                          {selectedPayment.latest_payment_proof_url.toLowerCase().endsWith(".pdf") ? (
                            <iframe
                              src={selectedPayment.latest_payment_proof_url}
                              title="Bukti pembayaran"
                              style={{ width: "100%", minHeight: 260, border: 0, background: "#fff" }}
                            />
                          ) : (
                            <img
                              src={selectedPayment.latest_payment_proof_url}
                              alt="Bukti pembayaran"
                              style={{ width: "100%", maxHeight: 360, objectFit: "contain", display: "block", background: "#f8f9fa" }}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <div className="small text-muted">Bukti Pembayaran</div>
                        <span className="text-muted">-</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mb-3">
                    <div className="small text-muted">Pembayaran</div>
                    <span className="text-muted">Belum ada pembayaran</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={closePaymentDetail}>
                  Tutup
                </button>

                {selectedPayment.payment_id && selectedPayment.latest_payment_status === "PENDING" ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={() => {
                        closePaymentDetail();
                        void handleUpdatePayment(selectedPayment, "APPROVED");
                      }}
                      disabled={updatingPaymentId === selectedPayment.payment_id}
                    >
                      {updatingPaymentId === selectedPayment.payment_id ? "Memproses..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => {
                        closePaymentDetail();
                        void handleUpdatePayment(selectedPayment, "REJECTED");
                      }}
                      disabled={updatingPaymentId === selectedPayment.payment_id}
                    >
                      {updatingPaymentId === selectedPayment.payment_id ? "Memproses..." : "Reject"}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="alert alert-danger mt-3" role="alert">
          {message}
        </div>
      )}
    </section>
  );
}
