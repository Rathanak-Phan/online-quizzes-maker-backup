import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token")?.value; // check if logged in
  const role = req.cookies.get("role")?.value;   // get role

  // If user is not logged in, redirect to /login
  if (!token && (url.pathname.startsWith("/admin") || url.pathname.startsWith("/teacher") || url.pathname.startsWith("/student"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based access
  if (url.pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (url.pathname.startsWith("/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (url.pathname.startsWith("/student") && role !== "user") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
