import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/auth/cookies";
import { AUTH_ROLES } from "@/src/lib/auth/constants";

export function assertAdminRequest(request) {
  const userId = request.cookies.get(AUTH_COOKIE.USER_ID)?.value;
  const role = request.cookies.get(AUTH_COOKIE.ROLE)?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (role !== AUTH_ROLES.ADMIN) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return null;
}

export async function readRequestCookieHeader() {
  // Keep compatibility across Next runtimes where `cookies`/`headers` can be sync or async.
  try {
    const cookieStore = typeof cookies === "function" ? await cookies() : cookies;
    if (typeof cookieStore?.toString === "function") {
      const serialized = cookieStore.toString();
      if (serialized) return serialized;
    }
  } catch (e) {
    // ignore and fallback to raw header
  }

  const requestHeaders = typeof headers === "function" ? await headers() : headers;
  return (typeof requestHeaders?.get === "function" ? requestHeaders.get("cookie") : "") || "";
}

export async function getInternalAuthFetchHeaders() {
  const cookieHeader = await readRequestCookieHeader();
  return cookieHeader ? { cookie: cookieHeader } : undefined;
}