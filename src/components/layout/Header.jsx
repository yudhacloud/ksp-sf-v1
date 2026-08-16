"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
   const [user, setUser] = useState(null);
   const [unreadCount, setUnreadCount] = useState(0);
   const router = useRouter();

   useEffect(() => {
      let mounted = true;
      fetch("/api/auth/user")
         .then((res) => res.json())
         .then((data) => {
            if (!mounted) return;
            setUser(data.user || null);
         })
         .catch(() => { });

      fetch("/api/notifications?unreadOnly=true")
         .then((res) => res.ok ? res.json() : { notifications: [] })
         .then((data) => {
            if (!mounted) return;
            setUnreadCount(Array.isArray(data.notifications) ? data.notifications.length : 0);
         })
         .catch(() => {
            if (!mounted) return;
            setUnreadCount(0);
         });

      return () => {
         mounted = false;
      };
   }, []);

   async function handleLogout(e) {
      e.preventDefault();
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
   }

   function handleOpenNotifications() {
      const targetPath = role === "admin" ? "/admin/notifications" : "/notifications";
      router.push(targetPath);
   }

   const title = user?.full_name || user?.name || user?.email || "Pengguna";
   const role = user?.role || null;

   return (
      <header className={styles.appHeader}>
         <div className={styles.inner}>
            <div className={styles.left}>
               <div className={styles.title}>{title}</div>
               {role && <div className={styles.role}>{role}</div>}
            </div>

            <div className={styles.right}>
               <button
                  type="button"
                  className={styles.bellBtn}
                  onClick={handleOpenNotifications}
                  aria-label="Buka notifikasi"
               >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.bellIcon}>
                     <path d="M12 3a5 5 0 0 1 5 5v2.5c0 1.1.33 2.18.96 3.08l1.27 1.78A1 1 0 0 1 18.39 16H5.61a1 1 0 0 1-.84-1.54l1.27-1.78A4.9 4.9 0 0 0 7 10.5V8a5 5 0 0 1 5-5Zm0 18a2.75 2.75 0 0 1-2.74-2h5.48A2.75 2.75 0 0 1 12 21Z" />
                  </svg>
                  {unreadCount > 0 && <span className={styles.bellDot} aria-label={`${unreadCount} notifikasi belum dibaca`} />}
               </button>

               <button className={styles.logoutBtn} onClick={handleLogout}>
                  Logout
               </button>
            </div>
         </div>
      </header>
   );
}
