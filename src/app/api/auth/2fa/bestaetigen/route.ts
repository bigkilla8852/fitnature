// src/app/api/auth/2fa/bestaetigen/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import twilio from "twilio"

export async function POST(req: NextRequest) {
  try {
    const { tempToken, code } = await req.json()

    // Sitzung finden
    const sitzung = await prisma.sitzung.findUnique({
      where: { token: tempToken },
      include: { user: true }
    })

    if (!sitzung) {
      return NextResponse.json(
        { fehler: "Ungültige Sitzung" },
        { status: 401 }
      )
    }

    // Abgelaufen?
    if (sitzung.ablaufAm < new Date()) {
      await prisma.sitzung.delete({ where: { token: tempToken } })
      return NextResponse.json(
        { fehler: "Code abgelaufen. Bitte neu einloggen." },
        { status: 401 }
      )
    }

    // Zu viele Versuche?
    if (sitzung.codeVersuche >= 3) {
      await prisma.sitzung.delete({ where: { token: tempToken } })
      return NextResponse.json(
        { fehler: "Zu viele falsche Versuche. Bitte neu einloggen." },
        { status: 401 }
      )
    }

    // Code prüfen
    let codeKorrekt = false

    if (process.env.TWILIO_ACCOUNT_SID === "mock") {
      // Mock-Modus
      codeKorrekt = code === "123456"
    } else {
      // Echter Twilio-Check
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      )

      try {
        const check = await client.verify.v2
          .services(process.env.TWILIO_VERIFY_SID!)
          .verificationChecks.create({
            to: sitzung.user.telefon!,
            code
          })
        codeKorrekt = check.status === "approved"
      } catch {
        codeKorrekt = false
      }
    }

    if (!codeKorrekt) {
      // Versuch zählen
      await prisma.sitzung.update({
        where: { token: tempToken },
        data: { codeVersuche: { increment: 1 } }
      })
      return NextResponse.json(
        { fehler: "Falscher Code" },
        { status: 401 }
      )
    }

    // Sitzung löschen (einmalig verwendbar)
    await prisma.sitzung.delete({ where: { token: tempToken } })

    return NextResponse.json({ erfolg: true })

  } catch (error) {
    console.error("2FA Bestätigen Fehler:", error)
    return NextResponse.json({ fehler: "Serverfehler" }, { status: 500 })
  }
}