"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

    // Kirim data registrasi ke API route yang mengelola Supabase Auth + profil.
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

    setMessage(
      "Pendaftaran berhasil. Anda akan diarahkan ke dashboard setelah login."
    );

    // Bersihkan form untuk keamanan.
    setDisplayName("");
    setPhone("");
    setEmail("");
    setPassword("");

    // Arahkan user ke halaman dashboard setelah registrasi.
    router.push("/dashboard");
  }

  return (
    <div className="container py-3">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="h4 mb-3">Daftar Akun</h1>
              <p className="text-muted">
                Gunakan email dan password untuk membuat akun Supabase.
              </p>

              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label htmlFor="displayName" className="form-label">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    className="form-control"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    required
                  />
                  <div className="form-text">
                    Nama yang akan disimpan pada profil pengguna.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                  />
                  <div className="form-text">
                    Nomor telepon akan disimpan sebagai metadata pada user.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    required
                  />
                  <div className="form-text">
                    Password minimal 6 karakter untuk keamanan.
                  </div>
                </div>

                {message && (
                  <div className="alert alert-info" role="alert">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Daftar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
