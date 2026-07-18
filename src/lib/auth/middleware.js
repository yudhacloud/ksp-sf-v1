import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { AUTH_ROLES } from "@/src/lib/auth/constants";

export function authMiddleware(request) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get(AUTH_COOKIE.ROLE);
  const userIdCookie = request.cookies.get(AUTH_COOKIE.USER_ID);
  const role = roleCookie?.value;
  const userId = userIdCookie?.value;

  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isDashboardPath = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const isLoggedIn = Boolean(userId);
  const isAdmin = role === AUTH_ROLES.ADMIN;

  // Halaman admin hanya untuk admin.
  if (isAdminPath) {
    if (!isAdmin) {
      const redirectTo = isLoggedIn ? "/dashboard" : "/login";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next();
  }

  // Halaman dashboard hanya untuk pengguna yang sudah login.
  if (isDashboardPath) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Halaman login/register hanya untuk yang belum login.
  if (isAuthPage && isLoggedIn) {
    const redirectTo = isAdmin ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}
