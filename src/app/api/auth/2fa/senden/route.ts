// src/app/api/auth/2fa/senden/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import twilio from "twilio"
import crypto from "crypto"

// Rate-Limiting: Verhindert Spam (max 3 SMS pro 15 Minuten)
const versuche = new Map<string, { anzahl: number; reset: number }>()

export async function POST(req: NextRequest) {
  try {
    const { email, passwort } = await req.json()

    // Rate-Limiting prüfen
    const ip = req.headers.get("x-forwarded-for") || "unbekannt"
    const jetzt = Date.now()
    const eintrag = versuche.get(ip)
    
    if (eintrag && eintrag.reset > jetzt && eintrag.anzahl >= 3) {
      return NextResponse.json(
        { fehler: "Zu viele Versuche. Bitte 15 Minuten warten." },
        { status: 429 }
      )
    }

    // User suchen
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Sicherheit: Gleiche Fehlermeldung egal ob User existiert oder nicht
      return NextResponse.json(
        { fehler: "Ungültige Zugangsdaten" },
        { status: 401 }
      )
    }

    // Passwort prüfen
    const korrekt = await bcrypt.compare(passwort, user.passwortHash)
    if (!korrekt) {
      // Rate-Limiting aktualisieren
      versuche.set(ip, {
        anzahl: (eintrag?.anzahl || 0) + 1,
        reset: jetzt + 15 * 60 * 1000
      })
      return NextResponse.json(
        { fehler: "Ungültige Zugangsdaten" },
        { status: 401 }
      )
    }

    // E-Mail verifiziert?
    if (!user.emailVerified) {
      return NextResponse.json(
        { fehler: "Bitte erst E-Mail bestätigen" },
        { status: 403 }
      )
    }

    // SMS senden via Twilio
    if (user.telefon && process.env.TWILIO_ACCOUNT_SID !== "mock") {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      )

      await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SID!)
        .verifications.create({
          to: user.telefon,
          channel: "sms"
        })
    } else {
      // Mock-Modus: Code ist immer "123456"
      console.log("🔧 MOCK: SMS-Code wäre 123456")
    }

    // Temporären Token erstellen (wird für nächsten Schritt gebraucht)
    const tempToken = crypto.randomBytes(32).toString("hex")
    
    await prisma.sitzung.create({
      data: {
        userId: user.id,
        token: tempToken,
        ablaufAm: new Date(Date.now() + 5 * 60 * 1000), // 5 Minuten
        codeVersuche: 0,
      }
    })

    return NextResponse.json({ tempToken, erfolg: true })

  } catch (error) {
    console.error("2FA Senden Fehler:", error)
    return NextResponse.json({ fehler: "Serverfehler" }, { status: 500 })
  }
}