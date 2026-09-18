import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authed = request.cookies.get("shamk-demo-auth")?.value === "1";
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/login";
  const isRoot = pathname === "/";

  if (!authed && !isLogin && !isRoot) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (authed && (isLogin || isRoot)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (!authed && isRoot) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
