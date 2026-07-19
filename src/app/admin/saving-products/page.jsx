import SavingProductsTable from "@/src/components/admin/saving-products-table/SavingProductsTable";
import PageHeader from "@/src/components/ui/PageHeader";
import { getInternalAuthFetchHeaders } from "@/src/lib/auth/server";

async function getSavingProducts() {
  // Fetch data API server-side pada saat render halaman
  // Mengggunakan URL absolut agar `fetch` server-side tidak gagal dengan path relatif
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const authHeaders = await getInternalAuthFetchHeaders()
  const response = await fetch(`${baseUrl}/api/admin/saving-products`,
    {
      cache: "no-store",
      headers: authHeaders
    })

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    throw new Error("Respons API member bukan JSON. Kemungkinan request ter-redirect ke halaman login.");
  }

  const result = await response.json()

  if (!response.ok) {
    throw new Error("Gagal mengambil data produk simpanan")
  }

  return result.saving_products || []

}

export default async function Page() {
  const savingProducts = await getSavingProducts()
  const totalProduk = savingProducts.length;
  const activeProducts = savingProducts.filter((product) => product.is_active).length
  const inActiveProducts = savingProducts.filter((product) => !product.is_active).length

  console.log("saving: ", savingProducts);

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Produk Simpanan"
        subtitle="Kelola produk simpanan koperasi dan atur opsi bagi anggota."
        actions={<a href="/admin/saving-products/create" className="btn btn-primary">
          Tambah Produk Simpanan
        </a>}
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Total Produk</p>
          <div className="admin-stat-value">{totalProduk}</div>
          <p>Produk terdaftar dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Total Produk Aktif</p>
          <div className="admin-stat-value">{activeProducts}</div>
          <p>Produk aktif dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Total Produk Non-Aktif</p>
          <div className="admin-stat-value">{inActiveProducts}</div>
          <p>Produk non-aktif dalam sistem.</p>
        </article>
      </div>

      <SavingProductsTable savingProducts={savingProducts} />
    </section>
  );
}
