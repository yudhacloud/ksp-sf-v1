import Link from "next/link";
import styles from "./page.module.css";

const features = [
  {
    title: "Simpanan Terarah",
    description: "Monitor semua jenis simpanan—pokok, wajib, dan sukarela—dalam satu dashboard yang terorganisir.",
    icon: "💰",
  },
  {
    title: "Pinjaman Terkelola",
    description: "Kelola pinjaman dengan tenor jelas, suku bunga transparan, dan jadwal cicilan yang mudah dipahami.",
    icon: "📋",
  },
  {
    title: "Pembayaran Mudah",
    description: "Lihat riwayat pembayaran, jatuh tempo cicilan, dan status transaksi dalam sekali pandang.",
    icon: "✓",
  },
  {
    title: "Keamanan Terjamin",
    description: "Sistem enkripsi tingkat enterprise menjaga setiap transaksi dan data pribadi Anda tetap aman.",
    icon: "🔒",
  },
  {
    title: "Akses 24/7",
    description: "Kelola keuangan Anda kapan saja, di mana saja dengan aplikasi web yang responsif dan cepat.",
    icon: "⏰",
  },
  {
    title: "Dukungan Profesional",
    description: "Tim support kami siap membantu menyelesaikan setiap pertanyaan dan kendala dengan cepat.",
    icon: "👥",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <p className={styles.badge}>KSP Sinergi Finansial</p>
            <h1 className={styles.heroTitle}>
              Solusi Keuangan Anggota Yang Aman, Cepat, dan Transparan
            </h1>
            <p className={styles.heroDescription}>
              Platform digital terpercaya untuk mengelola simpanan, pinjaman, dan transaksi keuangan anggota dengan mudah dan profesional.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/login" className={styles.btnPrimary}>
                Masuk ke Akun
              </Link>
              <Link href="/register" className={styles.btnSecondary}>
                Daftar Anggota
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Fitur Unggulan</h2>
            <p>Kelola keuangan Anda dengan sistem yang dirancang khusus untuk anggota</p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className={styles.trust}>
        <div className={styles.container}>
          <div className={styles.trustContent}>
            <h2>Dipercaya oleh Ribuan Anggota</h2>
            <p>Kami berkomitmen memberikan layanan keuangan yang aman, transparan, dan berpihak pada kesejahteraan anggota.</p>
            <div className={styles.trustStats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>5000+</div>
                <div className={styles.statLabel}>Anggota Aktif</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>Rp 50M+</div>
                <div className={styles.statLabel}>Aset Terkelola</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>99.9%</div>
                <div className={styles.statLabel}>Uptime Sistem</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Siap Mengelola Keuangan Anda?</h2>
            <p>Daftar sekarang dan nikmati kemudahan transaksi keuangan digital bersama KSP Sinergi Finansial.</p>
            <Link href="/register" className={styles.btnPrimaryLarge}>
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
