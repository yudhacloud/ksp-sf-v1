"use client";

// Sidebar navigasi sederhana sesuai pedoman copilot.md
// - Nama komponen: PascalCase
// - Variabel/fungsi: camelCase
// - Komentar dalam Bahasa Indonesia

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";

export default function Sidebar({ role = "member" }) {
   const pathname = usePathname();
   const router = useRouter();
   const normalizedPathname = pathname?.replace(/\/$/, "") || "/";
   const isAdminRoute = normalizedPathname.startsWith("/admin");
   const showAdminLinks = role === "admin" || isAdminRoute;

   const links = [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/loans", label: "Pinjaman" },
      { href: "/savings", label: "Simpanan" },
      { href: "/profile", label: "Profil" },
   ];

   const adminLinks = [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/members", label: "Anggota" },
      { href: "/admin/saving-products", label: "Produk Simpanan" },
      { href: "/admin/saving-monitoring", label: "Monitoring Simpanan" },
      { href: "/admin/saving-transactions", label: "Transaksi Simpanan" },
      { href: "/admin/loan-products", label: "Produk Pinjaman" },
      { href: "/admin/loan-applications", label: "Pengajuan Pinjaman" },
      { href: "/admin/loans", label: "Pinjaman Aktif" },
      { href: "/admin/installment-payments", label: "Pembayaran Cicilan" },
      { href: "/admin/reports", label: "Laporan" },
      { href: "/admin/settings", label: "Pengaturan" },
   ];

   function renderLink(item) {
      const normalizedHref = item.href.replace(/\/$/, "");
      const isActive =
         normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`);

      return (
         <li
            key={item.href}
            className={isActive ? `${styles.sidebarItem} ${styles.activeItem}` : styles.sidebarItem}
         >
            <Link
               href={item.href}
               className={`${styles.sidebarLink} ${isActive ? styles.activeLink : ""}`}
               aria-current={isActive ? "page" : undefined}
            >
               {item.label}
            </Link>
         </li>
      );
   }

   async function handleLogout(event) {
      event.preventDefault();
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
   }

   return (
      <aside className={styles.sidebar} aria-label="Sidebar">
         <div className={styles.sidebarHeader}>
            <img src="/assets/Logo.png" alt="Aplikasi KSP" className={styles.logo} />
         </div>

         <nav className={styles.sidebarNav}>
            {!isAdminRoute && (
               <ul className="list-unstyled mb-3">
                  {links.map(renderLink)}
               </ul>
            )}

            {showAdminLinks && (
               <>
                  <hr className={styles.sidebarDivider} />
                  <div className={`${styles.sidebarSection} `}>
                     <ul className="list-unstyled mb-0">
                        {adminLinks.map(renderLink)}
                     </ul>
                  </div>
               </>
            )}
         </nav>

         {/* logout moved to top header */}
      </aside>
   );
}
