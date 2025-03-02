import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname === "/";
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/chat") || request.nextUrl.pathname.startsWith("/home") || request.nextUrl.pathname.startsWith("/account");

  if (isProtectedRoute) {
    if (!token) {
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAuthPage && token) {
    const redirectUrl = new URL("/home", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}; 