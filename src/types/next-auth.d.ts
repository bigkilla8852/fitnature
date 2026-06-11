// src/types/next-auth.d.ts
// Erklärt: TypeScript weiß standardmäßig nicht, dass wir der
// Session extra Felder (id, rolle) hinzugefügt haben.
// Mit dieser Datei "erweitern" wir die NextAuth-Typen.

import { DefaultSession, DefaultJWT } from "next-auth"

// Session erweitern
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      rolle: string
    } & DefaultSession["user"]  // Behält Name, E-Mail, Bild
  }

  interface User {
    id: string
    rolle: string
  }
}

// JWT-Token erweitern
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    rolle: string
  }
}