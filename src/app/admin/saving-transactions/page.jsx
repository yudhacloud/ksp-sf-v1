import SavingTransactionsTable from "@/src/components/admin/saving-transactions-table/SavingTransactionsTable";
import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
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

      <SavingTransactionsTable />
    </section>
  );
}
