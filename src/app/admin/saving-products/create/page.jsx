"use client"

import PageHeader from "@/src/components/ui/PageHeader"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminSavingProductCreatePage() {
   const router = useRouter()
   const [name, setName] = useState("")
   const [savingType, setSavingType] = useState("POKOK")
   const [description, setDescription] = useState("")
   const [isActive, setIsActive] = useState(true)
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");

   async function handleSubmit(event) {
      event.preventDefault()
      setLoading(true)
      setMessage("")

      try {
         const response = await fetch("/api/admin/saving-products", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               name: name,
               saving_type: savingType,
               is_active: isActive,
               description: description
            })
         })

         const result = await response.json()
         setLoading(false)

         if (!response.ok) {
            setMessage(result.error || "Gagal menambah produk simpanan")
            return
         }

         router.push("/admin/saving-products")
      } catch (error) {
         setLoading(false);
         setMessage(error?.message || "Gagal menghubungi server.");
      }

   }
   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title={"Tambah Produk Simpanan"}
            subtitle={"Buat produk simpanan baru."}
         />

         <div className="admin-card">
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
                        value={isActive ? "true" : "false"}
                        onChange={(e) => setIsActive(e.target.value === "true")}
                        className="form-select"

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
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                     {loading ? "Menyimpan..." : "Tambah Produk Simpanan"}
                  </button>
                  <a href="/admin/saving-products" className="btn btn-outline-secondary">
                     Batal
                  </a>
               </div>
            </form>
         </div>
      </section>
   )

}