import SavingTransactionsTable from "@/src/components/admin/saving-transactions-table/SavingTransactionsTable";
import PageHeader from "@/src/components/ui/PageHeader";
import { getInternalAuthFetchHeaders } from "@/src/lib/auth/server";

async function getSavingTransactions() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const authHeaders = await getInternalAuthFetchHeaders()
  const response = await fetch(`${baseUrl}/api/admin/saving-transactions`,
    {
      cache: "no-store",
      headers: authHeaders
    })

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    throw new Error("Respons API saving product bukan JSON. Kemungkinan request ter-redirect ke halaman login.");
  }

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Gagal mengambil data transaksi simpanan")
  }

  return result.saving_transactions || []
}

export default async function Page() {
  const savingTransactions = await getSavingTransactions()

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title={"Transaksi Simpanan"}
        subtitle={"Lorem ipsum dolor sit amet..."}
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Total Transaksi</p>
          <div className="admin-stat-value">1250</div>
          <p>Total transaksi dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Transaksi Disetujui</p>
          <div className="admin-stat-value">613</div>
          <p>Total transaksi disetujui</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Transaksi Ditolak</p>
          <div className="admin-stat-value">451</div>
          <p>Total transaksi ditolak</p>
        </article>
      </div>

      <SavingTransactionsTable savingTransactions={savingTransactions} />
    </section>
  );
}
