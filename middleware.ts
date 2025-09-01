import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Skip middleware for API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuthenticated = !!token

  // Allow access to auth pages
  if (req.nextUrl.pathname.startsWith("/auth/")) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  // Allow access to home page
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next()
  }

  // Protect other routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
