"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function getProductLabel(product) {
   if (!product) return "Simpanan";
   return `${product.name} (${product.saving_type || "WAJIB"})`;
}

function formatCurrency(value) {
   return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
   }).format(Number(value || 0));
}

function formatDate(value) {
   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) return value;
   return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
   }).format(parsed);
}

function getStatusClass(status) {
   if (status === "Lunas") return "approved";
   if (status === "Sebagian") return "pending";
   return "rejected";
}

function getStatusLabel(status) {
   if (status === "Approved") return "Disetujui";
   if (status === "Pending") return "Menunggu";
   return status;
}

function getTransactionKindLabel(kind) {
   if (kind === "WAJIB") return "Wajib";
   if (kind === "SUKARELA") return "Sukarela";
   return "Lainnya";
}

function getObligationLabel(item) {
   if (item?.label) return item.label;
   if (item?.kind === "POKOK") return "Simpanan Pokok";
   if (item?.kind === "WAJIB") return "Simpanan Wajib";
   return "Tagihan Simpanan";
}

function getTransactionKindClass(kind) {
   if (kind === "WAJIB") return "pending";
   if (kind === "SUKARELA") return "approved";
   return "rejected";
}

export default function SavingsOverview() {
   const [activeTab, setActiveTab] = useState("billing");
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [feedback, setFeedback] = useState(null);
   const [overview, setOverview] = useState({
      balance: 0,
      mandatorySavings: 0,
      voluntarySavings: 0,
      pendingObligations: 0,
      obligations: [],
      transactions: [],
      accounts: [],
   });
   const [form, setForm] = useState({
      obligationId: null,
      amount: 0,
      paymentDate: "",
      proofFileName: "",
      note: "",
   });

   const loadOverview = useCallback(async () => {
      try {
         setIsLoading(true);
         const response = await fetch("/api/savings/overview");
         const result = await response.json();
         if (!response.ok) {
            if (response.status === 401) {
               if (typeof window !== "undefined") {
                  window.location.href = "/login";
               }
               return;
            }
            throw new Error(result.error || "Gagal memuat data simpanan.");
         }

         const nextOverview = result.overview || {};
         setOverview({
            balance: Number(nextOverview.balance || 0),
            mandatorySavings: Number(nextOverview.mandatorySavings || 0),
            voluntarySavings: Number(nextOverview.voluntarySavings || 0),
            pendingObligations: Number(nextOverview.pendingObligations || 0),
            obligations: nextOverview.obligations || [],
            transactions: nextOverview.transactions || [],
            accounts: nextOverview.accounts || [],
         });

         if (nextOverview.obligations?.length) {
            const firstUnpaid = nextOverview.obligations.find((item) => item.remainingAmount > 0) || nextOverview.obligations[0];
            setForm((current) => ({
               ...current,
               obligationId: firstUnpaid?.id ?? null,
               amount: firstUnpaid?.remainingAmount ?? 0,
               paymentDate: new Date().toISOString().slice(0, 10),
               proofFileName: "",
               note: "",
            }));
         }
      } catch (error) {
         setFeedback({ type: "error", message: error.message || "Gagal memuat data simpanan." });
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      const timerId = window.setTimeout(() => {
         void loadOverview();
      }, 0);

      return () => window.clearTimeout(timerId);
   }, [loadOverview]);

   const summaryCards = useMemo(
      () => [
         { title: "Total Simpanan Saya", value: formatCurrency(overview.balance), caption: "Jumlah saldo simpanan yang sudah tercatat" },
         { title: "Simpanan Pokok", value: overview.accounts.some((account) => account.type === "POKOK") ? "Aktif" : "Belum terdaftar", caption: "Pembayaran awal saat anggota bergabung" },
         { title: "Simpanan Wajib", value: formatCurrency(overview.mandatorySavings), caption: "Tagihan bulanan yang sedang berjalan" },
         { title: "Simpanan Sukarela", value: formatCurrency(overview.voluntarySavings), caption: "Setoran tambahan yang Anda kirim" },
      ],
      [overview],
   );

   const principalObligations = useMemo(() => overview.obligations.filter((item) => item.kind === "POKOK"), [overview.obligations]);
   const mandatoryObligations = useMemo(() => overview.obligations.filter((item) => item.kind === "WAJIB"), [overview.obligations]);
   const payableObligations = useMemo(() => overview.obligations.filter((item) => Number(item.remainingAmount || 0) > 0), [overview.obligations]);

   return (
      <div className="d-grid gap-4">
         <div className="admin-grid">
            {summaryCards.map((item) => (
               <article className="admin-card" key={item.title}>
                  <p className="admin-stat-title">{item.title}</p>
                  <div className="admin-stat-value">{item.value}</div>
                  <p className="text-muted">{item.caption}</p>
               </article>
            ))}
         </div>

         <div className="admin-card">
            <div className="d-flex flex-wrap gap-2 mb-3">
               <button className={`btn ${activeTab === "billing" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setActiveTab("billing")}>Tagihan dan Pembayaran</button>
               <button className={`btn ${activeTab === "transactions" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setActiveTab("transactions")}>Simpanan Sukarela</button>
            </div>

            {feedback ? (
               <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"} mb-3`} role="alert">
                  {feedback.message}
               </div>
            ) : null}

            {process.env.NODE_ENV !== "production" ? (
               <div className="d-flex flex-wrap gap-2 mb-3">
                  <button
                     className="btn btn-outline-secondary btn-sm"
                     type="button"
                     onClick={async () => {
                        try {
                           setFeedback(null);
                           const response = await fetch("/api/dev/savings/ensure-obligations", { method: "POST" });
                           const result = await response.json();
                           if (!response.ok) {
                              throw new Error(result.error || "Gagal menjalankan test wajib.");
                           }
                           setFeedback({ type: "success", message: result.message || "Simulasi tagihan wajib berhasil." });
                           await loadOverview();
                        } catch (error) {
                           setFeedback({ type: "error", message: error.message || "Gagal menjalankan test wajib." });
                        }
                     }}
                  >
                     Tes tagihan wajib
                  </button>
               </div>
            ) : null}

            {activeTab === "billing" && (
               <div className="row g-4">
                  <div className="col-lg-7">
                     <div className="admin-card" style={{ padding: "1rem" }}>
                        <h3 className="mb-3">Form Pembayaran</h3>
                        <p className="text-muted">Pilih tagihan yang ingin Anda bayar. Form ini dapat dipakai untuk tagihan simpanan pokok maupun wajib.</p>

                        <div className="admin-form-group">
                           <label htmlFor="obligationSelect">Pilih Tagihan</label>
                           <select
                              id="obligationSelect"
                              className="form-select admin-input"
                              value={form.obligationId ?? ""}
                              onChange={(event) => {
                                 const obligation = payableObligations.find((item) => item.id === event.target.value);
                                 setForm((current) => ({
                                    ...current,
                                    obligationId: obligation?.id ?? null,
                                    amount: obligation?.remainingAmount ?? 0,
                                 }));
                              }}
                              disabled={isLoading || payableObligations.length === 0}
                           >
                              {payableObligations.length === 0 ? (
                                 <option value="">Belum ada tagihan yang bisa dibayar</option>
                              ) : payableObligations.map((item) => (
                                 <option key={item.id} value={item.id}>
                                    {getObligationLabel(item)} · Periode {formatDate(item.period)} · {formatCurrency(item.remainingAmount)} belum dibayar
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className="row g-3">
                           <div className="col-md-6">
                              <div className="admin-form-group">
                                 <label htmlFor="paymentAmount">Nominal Pembayaran</label>
                                 <input
                                    id="paymentAmount"
                                    className="form-control admin-input"
                                    type="number"
                                    value={form.amount}
                                    onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) || 0 }))}
                                 />
                              </div>
                           </div>
                           <div className="col-md-6">
                              <div className="admin-form-group">
                                 <label htmlFor="paymentDate">Tanggal Bayar</label>
                                 <input
                                    id="paymentDate"
                                    className="form-control admin-input"
                                    type="date"
                                    value={form.paymentDate}
                                    onChange={(event) => setForm((current) => ({ ...current, paymentDate: event.target.value }))}
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="admin-form-group">
                           <label htmlFor="paymentNote">Catatan</label>
                           <textarea
                              id="paymentNote"
                              className="form-control admin-input"
                              rows="3"
                              value={form.note}
                              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                           />
                        </div>

                        <div className="admin-form-group">
                           <label htmlFor="proofUpload">Lampirkan Bukti</label>
                           <input
                              id="proofUpload"
                              className="form-control admin-input"
                              type="file"
                              onChange={(event) => setForm((current) => ({ ...current, proofFileName: event.target.files?.[0]?.name || "" }))}
                           />
                           {form.proofFileName ? <div className="small text-muted mt-2">File terpilih: {form.proofFileName}</div> : null}
                        </div>

                        <button className="btn btn-primary" type="button" disabled={isSubmitting} onClick={async () => {
                           setIsSubmitting(true);
                           setFeedback(null);

                           try {
                              const response = await fetch("/api/savings/transactions", {
                                 method: "POST",
                                 headers: { "Content-Type": "application/json" },
                                 body: JSON.stringify({
                                    obligationId: form.obligationId,
                                    amount: form.amount,
                                    paymentDate: form.paymentDate,
                                    note: form.note,
                                    proofUrl: form.proofFileName || null,
                                 }),
                              });

                              const result = await response.json();
                              if (!response.ok) {
                                 if (response.status === 401) {
                                    if (typeof window !== "undefined") {
                                       window.location.href = "/login";
                                    }
                                    return;
                                 }
                                 throw new Error(result.error || "Gagal mengirim pembayaran.");
                              }

                              setFeedback({ type: "success", message: "Pembayaran tagihan berhasil dikirim dan menunggu verifikasi admin." });
                           } catch (error) {
                              setFeedback({ type: "error", message: error.message || "Terjadi kesalahan saat mengirim pembayaran." });
                           } finally {
                              setIsSubmitting(false);
                           }
                        }}>
                           {isSubmitting ? "Mengirim..." : "Kirim Pembayaran"}
                        </button>
                     </div>
                  </div>

                  <div className="col-lg-5 d-grid gap-3">
                     <div className="admin-card" style={{ padding: "1rem" }}>
                        <h3 className="mb-3">Tagihan Simpanan Pokok</h3>
                        <div className="d-grid gap-2">
                           {isLoading ? (
                              <div className="text-muted">Memuat tagihan pokok...</div>
                           ) : principalObligations.length === 0 ? (
                              <div className="text-muted">Belum ada tagihan pokok.</div>
                           ) : principalObligations.map((item) => (
                              <div key={item.id} className="border rounded p-3">
                                 <div className="d-flex justify-content-between align-items-start gap-2">
                                    <div>
                                       <div className="fw-semibold">{getObligationLabel(item)}</div>
                                       <div className="small text-muted">Periode {formatDate(item.period)} · Jatuh tempo {formatDate(item.dueDate)}</div>
                                    </div>
                                    <span className={`admin-status-badge ${getStatusClass(item.status)}`}>{item.status}</span>
                                 </div>
                                 <div className="small text-muted mt-2">Tagihan: {formatCurrency(item.amountDue)} · Sisa: {formatCurrency(item.remainingAmount)}</div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="admin-card" style={{ padding: "1rem" }}>
                        <h3 className="mb-3">Tagihan Simpanan Wajib</h3>
                        <div className="d-grid gap-2">
                           {isLoading ? (
                              <div className="text-muted">Memuat tagihan wajib...</div>
                           ) : mandatoryObligations.length === 0 ? (
                              <div className="text-muted">Belum ada tagihan wajib.</div>
                           ) : mandatoryObligations.map((item) => (
                              <div key={item.id} className="border rounded p-3">
                                 <div className="d-flex justify-content-between align-items-start gap-2">
                                    <div>
                                       <div className="fw-semibold">{getObligationLabel(item)}</div>
                                       <div className="small text-muted">Periode {formatDate(item.period)} · Jatuh tempo {formatDate(item.dueDate)}</div>
                                    </div>
                                    <span className={`admin-status-badge ${getStatusClass(item.status)}`}>{item.status}</span>
                                 </div>
                                 <div className="small text-muted mt-2">Tagihan: {formatCurrency(item.amountDue)} · Sisa: {formatCurrency(item.remainingAmount)}</div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === "transactions" && (
               <div className="row g-4">
                  <div className="col-12">
                     <div className="admin-card" style={{ padding: "1rem" }}>
                        <h3 className="mb-3">Simpanan Sukarela</h3>
                        <p className="text-muted">Simpanan sukarela adalah setoran tambahan yang Anda kirim secara fleksibel, tanpa terikat tagihan bulanan.</p>
                        <div className="d-grid gap-2">
                           {isLoading ? (
                              <div className="text-muted">Memuat riwayat simpanan sukarela...</div>
                           ) : overview.transactions.length === 0 ? (
                              <div className="text-muted">Belum ada setoran sukarela.</div>
                           ) : overview.transactions.filter((item) => item.kind === "SUKARELA" || item.kind !== "WAJIB").map((item) => (
                              <div key={item.id} className="border rounded p-3">
                                 <div className="d-flex justify-content-between align-items-start gap-2">
                                    <div>
                                       <div className="fw-semibold">{item.title}</div>
                                       <div className="small text-muted">{formatDate(item.date)}</div>
                                    </div>
                                    <div className="text-end">
                                       <div className="fw-semibold">{formatCurrency(item.amount)}</div>
                                       <span className={`admin-status-badge ${item.status === "APPROVED" ? "approved" : item.status === "REJECTED" ? "rejected" : "pending"}`}>
                                          {getStatusLabel(item.status)}
                                       </span>
                                    </div>
                                 </div>
                                 <div className="small text-muted mt-2">Jenis: {getTransactionKindLabel(item.kind)}</div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
