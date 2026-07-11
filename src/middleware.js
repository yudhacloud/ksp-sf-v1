import { authMiddleware } from "@/src/lib/auth/middleware";

export function middleware(request) {
  return authMiddleware(request);
}
