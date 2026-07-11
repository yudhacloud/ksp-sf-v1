import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { AUTH_ROLES } from "@/src/lib/auth/constants";

export function authMiddleware(request) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get(AUTH_COOKIE.ROLE);
  const userIdCookie = request.cookies.get(AUTH_COOKIE.USER_ID);
  const role = roleCookie?.value;
  const userId = userIdCookie?.value;

  // Halaman admin hanya untuk role admin.
  if (pathname.startsWith("/admin")) {
    if (role !== AUTH_ROLES.ADMIN) {
      if (userId) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Halaman dashboard hanya untuk pengguna biasa.
  if (pathname.startsWith("/dashboard")) {
    if (!userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role === AUTH_ROLES.ADMIN) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}
