"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/src/components/ui/PageHeader";

export default function AdminSavingProductEditPage() {
   const params = useParams();
   const router = useRouter();
   const productId = params?.id;

   const [name, setName] = useState("");
   const [savingType, setSavingType] = useState("POKOK");
   const [description, setDescription] = useState("");
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
            const response = await fetch(`/api/admin/saving-products/${productId}`);
            const result = await response.json();

            if (!response.ok) {
               throw new Error(result.error || "Gagal mengambil data produk simpanan.");
            }

            if (!active) {
               return;
            }

            const product = result.saving_product;
            setName(product.name || "");
            setSavingType(product.saving_type || "POKOK");
            setDescription(product.description || "");
            setIsActive(Boolean(product.is_active));
         } catch (error) {
            if (active) {
               setMessage(error?.message || "Gagal mengambil data produk simpanan.");
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
         const response = await fetch(`/api/admin/saving-products/${productId}`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               name,
               saving_type: savingType,
               description,
               is_active: isActive,
            }),
         });

         const result = await response.json();
         setSaving(false);

         if (!response.ok) {
            setMessage(result.error || "Gagal memperbarui produk simpanan.");
            return;
         }

         router.push("/admin/saving-products");
      } catch (error) {
         setSaving(false);
         setMessage(error?.message || "Gagal menghubungi server.");
      }
   }

   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title="Edit Produk Simpanan"
            subtitle="Perbarui nama produk, tipe simpanan, deskripsi, dan status aktif."
         />

         <div className="admin-card">
            {loading ? (
               <div className="py-4 text-center text-muted">Memuat data produk simpanan...</div>
            ) : (
               <form onSubmit={handleSubmit}>
                  <div className="row gy-3">
                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="name">
                           Nama Produk Simpanan
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
                        <label className="form-label" htmlFor="savingType">
                           Tipe Simpanan
                        </label>
                        <select
                           id="savingType"
                           className="form-select"
                           value={savingType}
                           onChange={(event) => setSavingType(event.target.value)}
                        >
                           <option value="POKOK">Pokok</option>
                           <option value="WAJIB">Wajib</option>
                           <option value="SUKARELA">Sukarela</option>
                        </select>
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

                     <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="description">
                           Deskripsi
                        </label>
                        <input
                           id="description"
                           className="form-control"
                           value={description}
                           onChange={(event) => setDescription(event.target.value)}
                        />
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
                     <a href="/admin/saving-products" className="btn btn-outline-secondary">
                        Batal
                     </a>
                  </div>
               </form>
            )}
         </div>
      </section>
   );
}