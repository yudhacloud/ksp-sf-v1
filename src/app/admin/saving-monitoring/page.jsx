import SavingMonitoringTable from "@/src/components/admin/saving-monitoring-table/SavingMonitoringTable";
import PageHeader from "@/src/components/ui/PageHeader";
import { getInternalAuthFetchHeaders } from "@/src/lib/auth/server";

async function getSavingMonitoring() {
   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
   const authHeaders = await getInternalAuthFetchHeaders();
   const response = await fetch(`${baseUrl}/api/admin/saving-monitoring`, {
      cache: "no-store",
      headers: authHeaders,
   });

   const contentType = response.headers.get("content-type") || "";
   if (!contentType.includes("application/json")) {
      throw new Error("Respons API monitoring simpanan bukan JSON.");
   }

   const result = await response.json();

   if (!response.ok) {
      throw new Error(result.error || "Gagal mengambil data monitoring simpanan");
   }

   return result.saving_monitoring || [];
}

export default async function Page() {
   const monitoringData = await getSavingMonitoring();

   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title="Monitoring Simpanan"
            subtitle="Pantau status simpanan per anggota dan riwayat pembayaran bulanan secara lebih mudah dibaca."
            actions={<button className="btn btn-primary">Unduh Laporan</button>}
         />

         <SavingMonitoringTable monitoringData={monitoringData} />
      </section>
   );
}
