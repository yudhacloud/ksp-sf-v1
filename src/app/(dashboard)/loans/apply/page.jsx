"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/ui/PageHeader";

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
   const [amount, setAmount] = useState("");
   const [tenor, setTenor] = useState("");
   const [purpose, setPurpose] = useState("");
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [message, setMessage] = useState("");

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
         const response = await fetch("/api/loans/apply", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               loanProductId: selectedProductId,
               amount: Number(amount),
               tenor: Number(tenor),
               purpose,
            }),
         });

         const result = await response.json();
         if (!response.ok) {
            throw new Error(result.error || "Gagal mengajukan pinjaman.");
         }

         router.push("/loans");
      } catch (error) {
         setMessage(error?.message || "Gagal mengajukan pinjaman.");
      } finally {
         setSubmitting(false);
      }
   }

   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title="Ajukan Pinjaman"
            subtitle="Pilih produk pinjaman, tentukan nominal, tenor, dan tujuan pinjaman Anda."
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
                           type="number"
                           min="1"
                           className="form-control"
                           value={amount}
                           onChange={(event) => setAmount(event.target.value)}
                           required
                        />
                     </div>

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="tenor">Tenor (bulan)</label>
                        <input
                           id="tenor"
                           type="number"
                           min="1"
                           className="form-control"
                           value={tenor}
                           onChange={(event) => setTenor(event.target.value)}
                           required
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
