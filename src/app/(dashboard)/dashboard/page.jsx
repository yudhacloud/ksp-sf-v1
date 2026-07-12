import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  return (
    <div className="container py-3">
      <PageHeader title="User Dashboard" subtitle="Halaman sementara untuk pengguna yang sudah login." />

      <div className="row g-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card p-4 h-100">
            <p className="text-uppercase text-muted mb-2">Total Projects</p>
            <h2 className="mb-2">24</h2>
            <p className="text-muted mb-0">Increased from last month</p>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card p-4 h-100">
            <p className="text-uppercase text-muted mb-2">Ended Projects</p>
            <h2 className="mb-2">10</h2>
            <p className="text-muted mb-0">Completed this period</p>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card p-4 h-100">
            <p className="text-uppercase text-muted mb-2">Running Projects</p>
            <h2 className="mb-2">12</h2>
            <p className="text-muted mb-0">Currently in progress</p>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card p-4 h-100">
            <p className="text-uppercase text-muted mb-2">Pending Projects</p>
            <h2 className="mb-2">2</h2>
            <p className="text-muted mb-0">Waiting approval</p>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-3">
        <div className="col-12 col-xl-8">
          <div className="card p-4 h-100">
            <h3 className="mb-3">Project Analytics</h3>
            <div className="d-flex align-items-end gap-3">
              <div className="flex-fill" style={{ minHeight: 120, background: "rgba(6, 71, 52, 0.08)", borderRadius: 24 }}></div>
              <div className="flex-fill" style={{ minHeight: 150, background: "rgba(6, 71, 52, 0.16)", borderRadius: 24 }}></div>
              <div className="flex-fill" style={{ minHeight: 180, background: "rgba(6, 71, 52, 0.24)", borderRadius: 24 }}></div>
              <div className="flex-fill" style={{ minHeight: 150, background: "rgba(6, 71, 52, 0.12)", borderRadius: 24 }}></div>
              <div className="flex-fill" style={{ minHeight: 100, background: "rgba(6, 71, 52, 0.06)", borderRadius: 24 }}></div>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="card p-4 h-100">
            <h3 className="mb-3">Reminders</h3>
            <p className="mb-2">Meeting with Arc Company</p>
            <p className="text-muted mb-3">12:00 pm - 04:00 pm</p>
            <button className="btn btn-primary">Start Meeting</button>
          </div>
        </div>
      </div>
    </div>
  );
}
