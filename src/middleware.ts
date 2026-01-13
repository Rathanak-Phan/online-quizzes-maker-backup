// lib/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // check if token exists

  // Only protect /student, /teacher, /admin routes
  const protectedPaths = ["/student", "/teacher", "/admin"];
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      // User is not logged in → redirect to login
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // If token exists or route is public, continue
  return NextResponse.next();
}

// Define which paths this middleware runs on
export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*"],
};
