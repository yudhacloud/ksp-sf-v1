"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
   const [user, setUser] = useState(null);
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

      return () => {
         mounted = false;
      };
   }, []);

   async function handleLogout(e) {
      e.preventDefault();
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
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
               <button className={styles.logoutBtn} onClick={handleLogout}>
                  Logout
               </button>
            </div>
         </div>
      </header>
   );
}
