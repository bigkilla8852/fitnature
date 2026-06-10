// src/app/api/buchungen/route.ts
// Erklärt: Eine "Transaction" bedeutet: Entweder klappt ALLES
// (Credit abziehen + Platz reservieren), oder gar nichts.
// So verhindert man, dass Credits abgezogen werden aber keine Buchung entsteht.

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendeEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    // Eingeloggt?
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ fehler: "Nicht eingeloggt" }, { status: 401 })
    }

    const { kursId } = await req.json()
    const userId = session.user.id

    // TRANSACTION: Alles auf einmal oder gar nichts
    const ergebnis = await prisma.$transaction(async (tx) => {
      
      // 1. User-Daten mit Sperre laden (for update)
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true, vorname: true, email: true }
      })

      if (!user) throw new Error("USER_NOT_FOUND")
      
      // 2. Credits prüfen
      if (user.credits < 1) throw new Error("NICHT_GENUG_CREDITS")

      // 3. Kurs laden
      const kurs = await tx.kurs.findUnique({
        where: { id: kursId, aktiv: true, abgesagt: false },
        include: {
          buchungen: { where: { status: "BESTAETIGT" } },
          trainer: { include: { user: true } }
        }
      })

      if (!kurs) throw new Error("KURS_NOT_FOUND")
      if (kurs.startzeit < new Date()) throw new Error("KURS_VERGANGEN")

      // 4. Bereits gebucht?
      const bereitsGebucht = await tx.buchung.findFirst({
        where: { userId, kursId }
      })
      if (bereitsGebucht) throw new Error("BEREITS_GEBUCHT")

      // 5. Freie Plätze prüfen
      const freieplaetze = kurs.maxTeilnehmer - kurs.buchungen.length
      const aufWarteliste = freieplaetze <= 0

      // 6. Buchung erstellen
      const buchung = await tx.buchung.create({
        data: {
          userId,
          kursId,
          status: aufWarteliste ? "WARTELISTE" : "BESTAETIGT",
          wartelistePos: aufWarteliste
            ? (await tx.buchung.count({ where: { kursId, status: "WARTELISTE" } })) + 1
            : null
        }
      })

      // 7. Credit abziehen (nur wenn direkt gebucht, nicht Warteliste)
      if (!aufWarteliste) {
        await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } }
        })

        // Transaktion protokollieren
        await tx.kreditTransaktion.create({
          data: {
            userId,
            betrag: -1,
            typ: "BUCHUNG",
            beschreibung: `Buchung: ${kurs.titel}`
          }
        })

        // Revenue-Share: 40% für Trainer berechnen
        const trainerAnteil = Number(kurs.preisEuro) * 0.4
        await tx.trainerProfil.update({
          where: { id: kurs.trainerId },
          data: {
            gesamtEinnahmen: { increment: trainerAnteil },
            ausstehendAuszahlung: { increment: trainerAnteil }
          }
        })
      }

      return { buchung, aufWarteliste, kurs }
    })

    // Bestätigungs-E-Mail senden (außerhalb der Transaction)
    await sendeEmail({
      an: session.user.email!,
      betreff: ergebnis.aufWarteliste
        ? `Warteliste: ${ergebnis.kurs.titel}`
        : `Buchungsbestätigung: ${ergebnis.kurs.titel}`,
      text: ergebnis.aufWarteliste
        ? `Du stehst auf der Warteliste für "${ergebnis.kurs.titel}".`
        : `Deine Buchung für "${ergebnis.kurs.titel}" war erfolgreich!`
    })

    return NextResponse.json({
      erfolg: true,
      aufWarteliste: ergebnis.aufWarteliste,
      buchungsId: ergebnis.buchung.id
    })

  } catch (error: any) {
    const fehlermeldungen: Record<string, string> = {
      NICHT_GENUG_CREDITS: "Nicht genug Credits. Bitte zuerst Credits kaufen.",
      KURS_NOT_FOUND: "Kurs nicht gefunden",
      BEREITS_GEBUCHT: "Du hast diesen Kurs bereits gebucht",
      KURS_VERGANGEN: "Dieser Kurs hat bereits stattgefunden",
      USER_NOT_FOUND: "Benutzer nicht gefunden"
    }

    return NextResponse.json(
      { fehler: fehlermeldungen[error.message] || "Buchungsfehler" },
      { status: 400 }
    )
  }
}