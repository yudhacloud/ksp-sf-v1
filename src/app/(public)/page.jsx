import Link from "next/link";
import styles from "./page.module.css";

const benefits = [
  {
    title: "Simpanan Terarah",
    description: "Pantau simpanan pokok, wajib, dan sukarela secara jelas dalam satu dashboard.",
  },
  {
    title: "Tagihan yang Jelas",
    description: "Lihat jatuh tempo, nominal tagihan, dan status pembayaran tanpa kebingungan.",
  },
  {
    title: "Akses Cepat",
    description: "Masuk kapan saja untuk melihat riwayat transaksi dan kebutuhan keuangan Anda.",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>KSP Sinergi Finansial</p>
            <h1>Solusi keuangan anggota yang aman, cepat, dan transparan.</h1>
            <p>
              Nikmati pengalaman mengelola simpanan, tagihan, dan pinjaman dengan sistem yang sederhana namun profesional.
            </p>
            <div className={styles.ctas}>
              <Link className={styles.primary} href="/login">
                Masuk ke Akun
              </Link>
              <Link className={styles.secondary} href="/register">
                Daftar Anggota
              </Link>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.panelBadge}>Anggota Terpercaya</div>
            <h2>Kenapa anggota memilih kami?</h2>
            <ul>
              <li>Transaksi simpanan yang mudah dipantau</li>
              <li>Informasi tagihan yang selalu up to date</li>
              <li>Pelayanan digital yang efisien</li>
            </ul>
          </div>
        </section>

        <section className={styles.features}>
          {benefits.map((item) => (
            <article className={styles.featureCard} key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
