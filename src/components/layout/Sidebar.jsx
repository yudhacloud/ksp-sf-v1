"use client";

// Sidebar navigasi sederhana sesuai pedoman copilot.md
// - Nama komponen: PascalCase
// - Variabel/fungsi: camelCase
// - Komentar dalam Bahasa Indonesia

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

export default function Sidebar({ role = "pengguna" }) {
   const pathname = usePathname();

   const links = [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/loans", label: "Pinjaman" },
      { href: "/savings", label: "Simpanan" },
      { href: "/profile", label: "Profil" },
   ];

   const adminLinks = [
      { href: "/admin/dashboard", label: "Admin Dashboard" },
      { href: "/admin/members", label: "Anggota" },
      { href: "/admin/reports", label: "Laporan" },
      { href: "/admin/settings", label: "Pengaturan" },
   ];

   // Render link dengan kelas aktif jika path saat ini cocok
   function renderLink(item) {
      const isActive = pathname === item.href;
      return (
         <li key={item.href} className={isActive ? `${styles.sidebarItem} ${styles.active}` : styles.sidebarItem}>
            <Link href={item.href} className={styles.sidebarLink}>
               {item.label}
            </Link>
         </li>
      );
   }

   return (
      <aside className={`${styles.sidebar} bg-light border-end`} aria-label="Sidebar">
         <div className={`${styles.sidebarHeader} p-3`}>
            <h2 className="h5 mb-0">Aplikasi KSP</h2>
         </div>

         <nav className={`${styles.sidebarNav} p-3`}>
            <ul className="list-unstyled mb-3">
               {links.map(renderLink)}
            </ul>

            {role === "admin" && (
               <>
                  <hr />
                  <div className="sidebar-section mt-3">
                     <h6 className="text-muted">Admin</h6>
                     <ul className="list-unstyled mt-2">
                        {adminLinks.map(renderLink)}
                     </ul>
                  </div>
               </>
            )}
         </nav>
      </aside>
   );
}
