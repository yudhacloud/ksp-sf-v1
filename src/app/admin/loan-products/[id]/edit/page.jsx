"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/src/components/ui/PageHeader";

export default function AdminLoanProductEditPage() {
   const params = useParams();
   const router = useRouter();
   const productId = params?.id;

   const [name, setName] = useState("");
   const [maxAmount, setMaxAmount] = useState("");
   const [interestRate, setInterestRate] = useState("");
   const [maxTenor, setMaxTenor] = useState("");
   const [isActive, setIsActive] = useState(true);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [message, setMessage] = useState("");

   useEffect(() => {
      if (!productId) {
         return;
      }

      let active = true;

      async function loadProduct() {
         setLoading(true);
         setMessage("");

         try {
            const response = await fetch(`/api/admin/loan-products/${productId}`);
            const result = await response.json();

            if (!response.ok) {
               throw new Error(result.error || "Gagal mengambil data produk pinjaman.");
            }

            if (!active) {
               return;
            }

            const product = result.loan_product;
            setName(product.name || "");
            setMaxAmount(String(product.max_amount ?? ""));
            setInterestRate(String(product.interest_rate ?? ""));
            setMaxTenor(String(product.max_tenor ?? ""));
            setIsActive(Boolean(product.is_active));
         } catch (error) {
            if (active) {
               setMessage(error?.message || "Gagal mengambil data produk pinjaman.");
            }
         } finally {
            if (active) {
               setLoading(false);
            }
         }
      }

      loadProduct();

      return () => {
         active = false;
      };
   }, [productId]);

   async function handleSubmit(event) {
      event.preventDefault();
      setSaving(true);
      setMessage("");

      try {
         const response = await fetch(`/api/admin/loan-products/${productId}`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               name,
               max_amount: Number(maxAmount),
               interest_rate: Number(interestRate),
               max_tenor: Number(maxTenor),
               is_active: isActive,
            }),
         });

         const result = await response.json();
         setSaving(false);

         if (!response.ok) {
            setMessage(result.error || "Gagal memperbarui produk pinjaman.");
            return;
         }

         router.push("/admin/loan-products");
      } catch (error) {
         setSaving(false);
         setMessage(error?.message || "Gagal menghubungi server.");
      }
   }

   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title="Edit Produk Pinjaman"
            subtitle="Perbarui parameter pinjaman termasuk nominal, bunga, tenor, dan status."
         />

         <div className="admin-card">
            {loading ? (
               <div className="py-4 text-center text-muted">Memuat data produk pinjaman...</div>
            ) : (
               <form onSubmit={handleSubmit}>
                  <div className="row gy-3">
                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="name">
                           Nama Produk Pinjaman
                        </label>
                        <input
                           id="name"
                           className="form-control"
                           value={name}
                           onChange={(event) => setName(event.target.value)}
                           required
                        />
                     </div>

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="maxAmount">
                           Maksimal Nominal (Rp)
                        </label>
                        <input
                           id="maxAmount"
                           type="number"
                           min="1"
                           className="form-control"
                           value={maxAmount}
                           onChange={(event) => setMaxAmount(event.target.value)}
                           required
                        />
                     </div>

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="interestRate">
                           Suku Bunga (%)
                        </label>
                        <input
                           id="interestRate"
                           type="number"
                           min="0"
                           step="0.01"
                           className="form-control"
                           value={interestRate}
                           onChange={(event) => setInterestRate(event.target.value)}
                           required
                        />
                     </div>

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="maxTenor">
                           Maksimal Tenor (bulan)
                        </label>
                        <input
                           id="maxTenor"
                           type="number"
                           min="1"
                           className="form-control"
                           value={maxTenor}
                           onChange={(event) => setMaxTenor(event.target.value)}
                           required
                        />
                     </div>

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="isActive">
                           Status
                        </label>
                        <select
                           id="isActive"
                           className="form-select"
                           value={isActive ? "true" : "false"}
                           onChange={(event) => setIsActive(event.target.value === "true")}
                        >
                           <option value="true">Aktif</option>
                           <option value="false">Nonaktif</option>
                        </select>
                     </div>
                  </div>

                  {message && (
                     <div className="alert alert-danger mt-4" role="alert">
                        {message}
                     </div>
                  )}

                  <div className="mt-4 d-flex gap-2">
                     <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                     </button>
                     <a href="/admin/loan-products" className="btn btn-outline-secondary">
                        Batal
                     </a>
                  </div>
               </form>
            )}
         </div>
      </section>
   );
}