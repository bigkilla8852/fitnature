// src/app/api/kontakt/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendeEmail } from "@/lib/email"

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, telefon, organisation, anfrageTyp, beschreibung, wunschtermin } = body

    if (!name || !email || !anfrageTyp || !beschreibung) {
      return NextResponse.json({ fehler: "Pflichtfelder fehlen" }, { status: 400 })
    }

    // Anfrage in Datenbank speichern
    const anfrage = await prisma.anfrage.create({
      data: {
        name, email, telefon, organisation,
        anfrageTyp, beschreibung,
        wunschtermin: wunschtermin ? new Date(wunschtermin) : null
      }
    })

    // Admin benachrichtigen
    await sendeEmail({
      an: "info@fitnature.net",
      betreff: `Neue Anfrage: ${anfrageTyp} von ${name}`,
      text: `
Neue Kontaktanfrage auf FitNature.net:

Name: ${name}
E-Mail: ${email}
Telefon: ${telefon || "nicht angegeben"}
Organisation: ${organisation || "keine"}
Anfrageart: ${anfrageTyp}
Wunschtermin: ${wunschtermin || "nicht angegeben"}

Beschreibung:
${beschreibung}

---
Bearbeiten im Admin-Panel: https://fitnature.net/admin/anfragen/${anfrage.id}
      `
    })

    // Bestätigungs-E-Mail an Anfragenden
    await sendeEmail({
      an: email,
      betreff: "Deine Anfrage bei FitNature.net",
      text: `Hallo ${name},\n\nwir haben deine Anfrage erhalten und melden uns innerhalb von 2 Werktagen.\n\nDein FitNature-Team`
    })

    return NextResponse.json({ erfolg: true })

  } catch (error) {
    console.error("Kontakt-Fehler:", error)
    return NextResponse.json({ fehler: "Serverfehler" }, { status: 500 })
  }
}