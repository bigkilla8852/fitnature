// src/lib/auth.ts
// Erklärt: NextAuth verwaltet alle Login-Sessions.

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        passwort: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.passwort) return null
        
        // User in der Datenbank suchen
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user) return null
        
        // Passwort überprüfen
        const passwortKorrekt = await bcrypt.compare(
          credentials.passwort as string,
          user.passwortHash
        )
        
        if (!passwortKorrekt) return null
        
        // User zurückgeben (ohne Passwort!)
        return {
          id: user.id,
          email: user.email,
          name: `${user.vorname} ${user.nachname}`,
          rolle: user.rolle,
        }
      }
    })
  ],
  callbacks: {
    // Rolle zum Token hinzufügen
    async jwt({ token, user }) {
  if (user) {
    token.id = user.id

    if ("rolle" in user) {
      token.rolle = user.rolle as string
    }
  }

  return token
},
    // Rolle zur Session hinzufügen
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.rolle = token.rolle as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',    // Eigene Login-Seite
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 Tag
  }
})