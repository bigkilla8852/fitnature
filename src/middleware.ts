// src/middleware.ts
// Erklärt: Middleware läuft bei JEDER Anfrage und prüft,
// ob der User berechtigt ist, diese Seite zu sehen.

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const session = await auth()
  const pfad = request.nextUrl.pathname

  // Admin-Bereich: Nur für Admins
  if (pfad.startsWith("/admin")) {
    if (!session?.user || session.user.rolle !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Trainer-Bereich: Nur für Trainer
  if (pfad.startsWith("/trainer")) {
    if (!session?.user || !["TRAINER", "ADMIN"].includes(session.user.rolle as string)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Dashboard: Nur für eingeloggte User
  if (pfad.startsWith("/dashboard")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/trainer/:path*", "/dashboard/:path*"]
}