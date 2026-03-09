import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PASSWORD_COOKIE = "sagd_auth";
const HASHED_PASSWORD = "a]3#fK9$mQ"; // obfuscated token stored in cookie when authenticated

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page, login API, and rollout dashboard
  if (
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    pathname === "/rollout" ||
    pathname.startsWith("/rollout/")
  ) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(PASSWORD_COOKIE);

  if (!authCookie || authCookie.value !== HASHED_PASSWORD) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
