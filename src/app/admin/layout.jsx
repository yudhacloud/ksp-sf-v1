export const metadata = {
  title: 'Admin',
  description: 'Admin area',
};

import Sidebar from "@/src/components/layout/Sidebar";
import { cookies, headers } from "next/headers";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";

function readRoleFromCookies() {
  // Support environments where `cookies` may be exported as a function or object
  try {
    const cookieStore = typeof cookies === "function" ? cookies() : cookies;
    const roleCookie = cookieStore?.get?.(AUTH_COOKIE.ROLE);
    if (roleCookie) return roleCookie.value;
  } catch (e) {
    // ignore and fallback to header parsing
  }

  // Fallback: parse Cookie header manually
  const h = headers();
  const cookieHeader = (typeof h.get === "function" ? h.get("cookie") : h.cookie) || "";
  const parsed = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const idx = c.indexOf("=");
        const k = idx === -1 ? c : c.slice(0, idx);
        const v = idx === -1 ? "" : c.slice(idx + 1);
        return [k, decodeURIComponent(v)];
      })
  );

  return parsed[AUTH_COOKIE.ROLE] || "pengguna";
}

export default function AdminLayout({ children }) {
  const role = readRoleFromCookies();

  return (
    <section className="d-flex">
      <Sidebar role={role} />
      <main className="flex-grow-1 p-3">{children}</main>
    </section>
  );
}
