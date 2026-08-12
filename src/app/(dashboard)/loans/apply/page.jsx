"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/ui/PageHeader";
import { toastError, toastSuccess, toastWarning } from "@/src/lib/toast";

function formatCurrency(value) {
   return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
   }).format(Number(value || 0));
}

export default function LoanApplyPage() {
   const router = useRouter();
   const [products, setProducts] = useState([]);
   const [selectedProductId, setSelectedProductId] = useState("");
   const [purpose, setPurpose] = useState("");
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [message, setMessage] = useState("");

   const selectedProduct = products.find((product) => product.id === selectedProductId) || null;
   const autoAmount = selectedProduct ? Number(selectedProduct.max_amount) : 0;
   const autoTenor = selectedProduct ? Number(selectedProduct.max_tenor) : 0;

   useEffect(() => {
      async function loadProducts() {
         try {
            const response = await fetch("/api/loans/apply");
            if (!response.ok) {
               throw new Error("Gagal memuat produk pinjaman.");
            }

            const result = await response.json();
            setProducts(result.products || []);
            if (result.products?.[0]?.id) {
               setSelectedProductId(result.products[0].id);
            }
         } catch (error) {
            setMessage(error?.message || "Gagal memuat produk pinjaman.");
         } finally {
            setLoading(false);
         }
      }

      loadProducts();
   }, []);

   async function handleSubmit(event) {
      event.preventDefault();
      setSubmitting(true);
      setMessage("");

      try {
         if (!selectedProduct) {
            throw new Error("Pilih produk pinjaman terlebih dahulu.");
         }

         const response = await fetch("/api/loans/apply", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               loanProductId: selectedProductId,
               amount: autoAmount,
               tenor: autoTenor,
               purpose,
            }),
         });

         const result = await response.json();
         if (!response.ok) {
            throw new Error(result.error || "Gagal mengajukan pinjaman.");
         }

         toastSuccess("Pengajuan pinjaman berhasil dikirim.");
         router.push("/loans");
      } catch (error) {
         toastError(error?.message || "Gagal mengajukan pinjaman.");
      } finally {
         setSubmitting(false);
      }
   }

   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title="Ajukan Pinjaman"
            subtitle="Pilih produk pinjaman, lalu nominal dan tenor akan diisi otomatis berdasarkan produk yang dipilih."
         />

         <div className="admin-card">
            {loading ? (
               <div className="py-4 text-center text-muted">Memuat produk pinjaman...</div>
            ) : (
               <form onSubmit={handleSubmit}>
                  <div className="row gy-3">
                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="loanProduct">Produk Pinjaman</label>
                        <select
                           id="loanProduct"
                           className="form-select"
                           value={selectedProductId}
                           onChange={(event) => setSelectedProductId(event.target.value)}
                           required
                        >
                           {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                 {product.name} — {formatCurrency(product.max_amount)} • {product.max_tenor} bulan
                              </option>
                           ))}
                        </select>
                     </div>

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="amount">Nominal Pinjaman</label>
                        <input
                           id="amount"
                           type="text"
                           className="form-control"
                           value={selectedProduct ? formatCurrency(autoAmount) : ""}
                           readOnly
                        />
                     </div>

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="tenor">Tenor (bulan)</label>
                        <input
                           id="tenor"
                           type="text"
                           className="form-control"
                           value={selectedProduct ? `${autoTenor} bulan` : ""}
                           readOnly
                        />
                     </div>

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="purpose">Tujuan Pinjaman</label>
                        <textarea
                           id="purpose"
                           className="form-control"
                           rows="4"
                           value={purpose}
                           onChange={(event) => setPurpose(event.target.value)}
                           placeholder="Contoh: Renovasi rumah"
                        />
                     </div>
                  </div>

                  {message && (
                     <div className="alert alert-danger mt-4" role="alert">
                        {message}
                     </div>
                  )}

                  <div className="mt-4 d-flex gap-2">
                     <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? "Mengajukan..." : "Ajukan Pinjaman"}
                     </button>
                     <a href="/loans" className="btn btn-outline-secondary">
                        Batal
                     </a>
                  </div>
               </form>
            )}
         </div>
      </section>
   );
}
