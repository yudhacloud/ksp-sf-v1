"use client";

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../AuthPage.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        phone,
      }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error || "Gagal mendaftar, coba lagi.");
      return;
    }

    setMessage("Pendaftaran berhasil. Anda dapat masuk menggunakan akun baru Anda.");
    setDisplayName("");
    setPhone("");
    setEmail("");
    setPassword("");
    router.push("/login");
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Buat Akun Baru</h1>
          <p className={styles.authSubtitle}>
            Daftar untuk mengakses layanan koperasi dan melacak pinjaman serta simpanan Anda.
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label htmlFor="displayName" className={styles.formLabel}>
              Nama Lengkap
            </label>
            <input
              id="displayName"
              type="text"
              className={styles.formControl}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
            />
            <p className={styles.formText}>Nama lengkap sesuai dokumen resmi.</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.formLabel}>
              Nomor Telepon
            </label>
            <input
              id="phone"
              type="tel"
              className={styles.formControl}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
            <p className={styles.formText}>
              Nomor telepon aktif untuk notifikasi dan verifikasi.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles.formControl}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.formControl}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
            <p className={styles.formText}>Minimal 6 karakter untuk keamanan akun.</p>
          </div>

          {message && <div className={styles.alertMessage}>{message}</div>}

          <button type="submit" className={styles.primaryButton} disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <div className={styles.linkRow}>
          Sudah punya akun? <a href="/login">Masuk sekarang</a>
        </div>
      </div>
    </div>
  );
}
