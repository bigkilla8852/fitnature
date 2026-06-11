// src/proxy.ts
// In Next.js 16+ heißt die Datei "proxy.ts" statt "middleware.ts"

import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const pfad = request.nextUrl.pathname

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Admin-Bereich
  if (pfad.startsWith("/admin")) {
    if (!token || token.rolle !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Trainer-Bereich
  if (pfad.startsWith("/trainer")) {
    if (!token || !["TRAINER", "ADMIN"].includes(token.rolle as string)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Dashboard
  if (pfad.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/trainer/:path*", "/dashboard/:path*"],
}