"use client";

import { useCallback, useEffect, useState } from "react";
import SavingMonitoringTable from "@/src/components/admin/saving-monitoring-table/SavingMonitoringTable";
import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
   const [monitoringData, setMonitoringData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   const loadSavingMonitoring = useCallback(async () => {
      try {
         setLoading(true);
         setError("");
         const response = await fetch("/api/admin/saving-monitoring");

         if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || "Gagal mengambil data monitoring simpanan.");
         }

         const result = await response.json();
         setMonitoringData(result.saving_monitoring || []);
      } catch (err) {
         console.error("Error fetching saving monitoring:", err);
         setError(err?.message || "Terjadi kesalahan saat memuat data monitoring simpanan.");
         setMonitoringData([]);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      loadSavingMonitoring();
   }, [loadSavingMonitoring]);

   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title="Monitoring Simpanan"
            subtitle="Pantau status simpanan per anggota dan riwayat pembayaran bulanan secara lebih mudah dibaca."
         />

         {error && (
            <div className="alert alert-danger" role="alert">
               {error}
            </div>
         )}

         {loading ? (
            <div className="text-muted py-3">Memuat data monitoring simpanan...</div>
         ) : (
            <SavingMonitoringTable monitoringData={monitoringData} />
         )}
      </section>
   );
}
