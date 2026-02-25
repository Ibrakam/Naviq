import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const appProtectedPrefixes = ["/dashboard", "/assessment", "/courses", "/simulations", "/professions", "/roadmap", "/profile"];

function isProtected(pathname: string) {
  return appProtectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("naviq_access_token")?.value;
  const role = (request.cookies.get("naviq_role")?.value || "student").toLowerCase();

  if ((isProtected(pathname) || pathname.startsWith("/admin")) && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
