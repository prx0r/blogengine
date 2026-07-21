import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stringifySetCookie, parseCookie } from "cookie";

const SITE_PASSWORD = process.env.SITE_PASSWORD;

const protectedPaths = ["/", "/entry", "/sources", "/personal"];
const publicPaths = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (!protectedPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!SITE_PASSWORD) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = parseCookie(cookieHeader);
  const authCookie = cookies["distillery_auth"];

  // Check password cookie OR Google session cookie
  if (authCookie === SITE_PASSWORD || cookies["session_id"]) {
    return NextResponse.next();
  }

  const password = request.nextUrl.searchParams.get("password");
  if (password === SITE_PASSWORD) {
    const response = NextResponse.redirect(new URL(pathname, request.url));
    response.headers.set(
      "set-cookie",
      stringifySetCookie({
        name: "distillery_auth",
        value: SITE_PASSWORD,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
    );
    return response;
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icon.svg).*)"],
};
