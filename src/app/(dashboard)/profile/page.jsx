"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";
import { toastError, toastSuccess } from "@/src/lib/toast";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitials(fullName) {
  return fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
}

export default function Page() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/auth/user");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memuat profil.");
      }

      setProfile(result.user || null);
      setEditForm(result.user || {});
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan saat memuat profil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleUpdateProfile(e) {
    e.preventDefault();

    if (!editForm.full_name?.trim()) {
      toastError("Nama lengkap tidak boleh kosong.");
      return;
    }

    if (!editForm.phone?.trim()) {
      toastError("Nomor telepon tidak boleh kosong.");
      return;
    }

    if (!editForm.address?.trim()) {
      toastError("Alamat tidak boleh kosong.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: editForm.full_name,
          phone: editForm.phone,
          address: editForm.address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui profil.");
      }

      toastSuccess("Profil berhasil diperbarui.");
      setProfile(result.profile || result.user || editForm);
      setEditMode(false);
    } catch (err) {
      toastError(err?.message || "Gagal memperbarui profil.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();

    if (!passwordForm.oldPassword.trim()) {
      toastError("Password lama tidak boleh kosong.");
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      toastError("Password baru tidak boleh kosong.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toastError("Password baru minimal 6 karakter.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toastError("Password baru dan konfirmasi tidak sesuai.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: passwordForm.oldPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengganti password.");
      }

      toastSuccess("Password berhasil diubah.");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordModal(false);
    } catch (err) {
      toastError(err?.message || "Gagal mengganti password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Profil Saya"
        subtitle="Kelola informasi profil dan keamanan akun Anda."
        actions={
          !editMode && (
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
                Edit Profil
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setShowPasswordModal(true)}
              >
                Ganti Password
              </button>
            </div>
          )
        }
      />

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-muted py-3">Memuat profil...</div>
      ) : profile && !editMode ? (
        <div className="row g-4">
          {/* Profile Card */}
          <div className="col-lg-4">
            <div className="admin-card h-100">
              <div className="text-center">
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #064734 0%, #0a5c3e 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    fontWeight: 700,
                    color: "white",
                    margin: "0 auto 20px",
                  }}
                >
                  {getInitials(profile.full_name)}
                </div>
                <h3 className="mb-1">{profile.full_name || "Pengguna"}</h3>
                <p className="text-muted mb-3">{profile.member_number}</p>
                <div className="mb-4">
                  <span
                    className={`admin-status-badge ${profile.status ? "approved" : "rejected"}`}
                  >
                    {profile.status ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>

              <hr />

              <div className="d-grid gap-2">
                <div>
                  <div className="small text-muted">Bergabung Sejak</div>
                  <div className="fw-semibold">{formatDate(profile.created_at)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="col-lg-8">
            <div className="admin-card">
              <h3 className="mb-4">Informasi Pribadi</h3>

              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <div>
                    <label className="form-label text-muted">Nomor Anggota</label>
                    <p className="fw-semibold">{profile.member_number || "-"}</p>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div>
                    <label className="form-label text-muted">Nama Lengkap</label>
                    <p className="fw-semibold">{profile.full_name || "-"}</p>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div>
                    <label className="form-label text-muted">Email</label>
                    <p className="fw-semibold">{profile.email || "-"}</p>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div>
                    <label className="form-label text-muted">Nomor Telepon</label>
                    <p className="fw-semibold">{profile.phone || "-"}</p>
                  </div>
                </div>

                <div className="col-12">
                  <div>
                    <label className="form-label text-muted">Alamat</label>
                    <p className="fw-semibold">{profile.address || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : profile && editMode ? (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="admin-card">
              <h3 className="mb-4">Edit Profil</h3>

              <form onSubmit={handleUpdateProfile}>
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <div className="admin-form-group">
                      <label htmlFor="memberNumber">Nomor Anggota</label>
                      <input
                        id="memberNumber"
                        className="form-control admin-input"
                        value={profile.member_number || ""}
                        disabled
                      />
                      <small className="text-muted">Nomor anggota tidak dapat diubah.</small>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="admin-form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        className="form-control admin-input"
                        value={profile.email || ""}
                        disabled
                      />
                      <small className="text-muted">Email tidak dapat diubah.</small>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="admin-form-group">
                      <label htmlFor="fullName">Nama Lengkap *</label>
                      <input
                        id="fullName"
                        className="form-control admin-input"
                        value={editForm.full_name || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            full_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="admin-form-group">
                      <label htmlFor="phone">Nomor Telepon *</label>
                      <input
                        id="phone"
                        className="form-control admin-input"
                        value={editForm.phone || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="admin-form-group">
                      <label htmlFor="status">Status Anggota</label>
                      <input
                        id="status"
                        className="form-control admin-input"
                        value={profile.status ? "Aktif" : "Nonaktif"}
                        disabled
                      />
                      <small className="text-muted">Status tidak dapat diubah.</small>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="admin-form-group">
                      <label htmlFor="address">Alamat *</label>
                      <textarea
                        id="address"
                        className="form-control admin-input"
                        rows="3"
                        value={editForm.address || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            address: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setEditMode(false);
                      setEditForm(profile);
                    }}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ganti Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowPasswordModal(false)}
                />
              </div>
              <form onSubmit={handleChangePassword}>
                <div className="modal-body">
                  <div className="admin-form-group mb-3">
                    <label htmlFor="oldPassword">Password Lama *</label>
                    <input
                      id="oldPassword"
                      type="password"
                      className="form-control admin-input"
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          oldPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group mb-3">
                    <label htmlFor="newPassword">Password Baru *</label>
                    <input
                      id="newPassword"
                      type="password"
                      className="form-control admin-input"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <small className="text-muted">Minimal 6 karakter.</small>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="confirmPassword">Konfirmasi Password Baru *</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-control admin-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Mengubah..." : "Ubah Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
