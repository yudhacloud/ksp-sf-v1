"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function Page() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat notifikasi.");
        }

        setItems(result.notifications || []);
      } catch (loadError) {
        setError(loadError.message || "Gagal memuat notifikasi.");
      } finally {
        setLoading(false);
      }
    }

    void loadNotifications();
  }, []);

  async function handleMarkAsRead(id) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });

      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
    } catch (markError) {
      console.error(markError);
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    if (a.is_read !== b.is_read) {
      return Number(a.is_read) - Number(b.is_read);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Notifikasi"
        subtitle="Pantau pemberitahuan aktivitas, status pembayaran, dan keputusan admin."
      />

      <div className="admin-card">
        {loading ? (
          <div className="text-muted py-3">Memuat notifikasi...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : sortedItems.length === 0 ? (
          <div className="text-muted py-3">Belum ada notifikasi.</div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className={`border rounded-4 p-3 ${item.is_read
                    ? "bg-white border-light-subtle"
                    : "bg-primary-subtle border-primary-subtle shadow-sm"
                  }`}
              >
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                  <div className="d-flex align-items-start gap-2">
                    {!item.is_read && (
                      <span
                        className="mt-1 rounded-circle bg-primary"
                        style={{ width: 10, height: 10, display: "inline-block" }}
                        aria-label="Notifikasi belum dibaca"
                      />
                    )}

                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span className="small text-uppercase text-muted">Notifikasi</span>
                        {!item.is_read ? (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                            Baru
                          </span>
                        ) : (
                          <span className="badge bg-light text-secondary border">
                            Sudah dibaca
                          </span>
                        )}
                      </div>
                      <h5 className="mb-1">{item.title}</h5>
                      <p className="mb-2 text-muted">{item.message}</p>
                      <div className="small text-muted">{formatDate(item.created_at)}</div>
                    </div>
                  </div>

                  {!item.is_read && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleMarkAsRead(item.id)}
                    >
                      Tandai terbaca
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
