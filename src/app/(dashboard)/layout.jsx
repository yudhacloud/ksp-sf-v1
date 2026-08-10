export const metadata = {
  title: 'Dashboard',
  description: 'Dashboard area',
};

import Sidebar from "@/src/components/layout/Sidebar";
import Header from "@/src/components/layout/Header";
import { cookies, headers } from "next/headers";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";

async function readRoleFromCookies() {
  try {
    const cookieStore = typeof cookies === "function" ? await cookies() : cookies;
    const roleCookie = cookieStore?.get?.(AUTH_COOKIE.ROLE);
    if (roleCookie) return roleCookie.value;
  } catch (e) {
    // ignore and fallback
  }

  const h = typeof headers === "function" ? await headers() : headers;
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

  return parsed[AUTH_COOKIE.ROLE] || "member";
}

export default async function DashboardLayout({ children }) {
  const role = await readRoleFromCookies();

  return (
    <section className="d-flex">
      <Sidebar role={role} />
      <main className="flex-grow-1">
        <Header />
        <div className="p-3">{children}</div>
      </main>
    </section>
  );
}
