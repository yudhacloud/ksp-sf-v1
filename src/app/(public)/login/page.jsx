"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../AuthPage.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error || "Gagal login, coba lagi.");
      return;
    }

    const nextPath = result.profile?.role === "admin" ? "/admin/dashboard" : "/dashboard";
    router.push(nextPath);
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Welcome Back!</h1>
          <p className={styles.authSubtitle}>
            Masuk untuk mengelola akun dan melihat ringkasan keuangan koperasi.
          </p>
        </div>

        <form onSubmit={handleLogin}>
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
              required
            />
          </div>

          {message && <div className={styles.alertMessage}>{message}</div>}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className={styles.divider}>atau masuk dengan</div>

        <div className={styles.linkRow}>
          Belum punya akun? <a href="/register">Daftar sekarang</a>
        </div>
      </div>
    </div>
  );
}
