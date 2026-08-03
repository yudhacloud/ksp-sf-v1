import SavingsOverview from "@/src/components/user/savings/SavingsOverview";

export default function Page() {
  return (
    <section className="container py-3 admin-page">
      <div className="mb-4">
        <h1 className="mb-2">Simpanan Saya</h1>
        <p className="text-muted">Lihat saldo, tagihan bulanan, dan riwayat transaksi simpanan Anda.</p>
      </div>

      <SavingsOverview />
    </section>
  );
}
