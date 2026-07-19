"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/ui/PageHeader";

export default function AdminLoanProductCreatePage() {
   const router = useRouter();
   const [name, setName] = useState("");
   const [maxAmount, setMaxAmount] = useState("");
   const [interestRate, setInterestRate] = useState("");
   const [maxTenor, setMaxTenor] = useState("");
   const [isActive, setIsActive] = useState(true);
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");

   async function handleSubmit(event) {
      event.preventDefault();
      setLoading(true);
      setMessage("");

      try {
         const response = await fetch("/api/admin/loan-products", {
            method: "POST",
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
         setLoading(false);

         if (!response.ok) {
            setMessage(result.error || "Gagal menambahkan produk pinjaman.");
            return;
         }

         router.push("/admin/loan-products");
      } catch (error) {
         setLoading(false);
         setMessage(error?.message || "Gagal menghubungi server.");
      }
   }

   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title="Tambah Produk Pinjaman"
            subtitle="Buat produk pinjaman baru dengan ketentuan nominal, bunga, dan tenor."
         />

         <div className="admin-card">
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
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                     {loading ? "Menyimpan..." : "Tambah Produk Pinjaman"}
                  </button>
                  <a href="/admin/loan-products" className="btn btn-outline-secondary">
                     Batal
                  </a>
               </div>
            </form>
         </div>
      </section>
   );
}