// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      vorname, nachname, email, passwort,
      telefon, strasse, hausnummer, plz, ort
    } = body

    // Pflichtfelder prüfen
    if (!vorname || !nachname || !email || !passwort) {
      return NextResponse.json(
        { fehler: "Bitte alle Pflichtfelder ausfüllen" },
        { status: 400 }
      )
    }

    // Passwort-Stärke prüfen
    if (passwort.length < 8) {
      return NextResponse.json(
        { fehler: "Passwort muss mindestens 8 Zeichen haben" },
        { status: 400 }
      )
    }

    // Prüfen ob E-Mail schon vergeben
    const vorhanden = await prisma.user.findUnique({ where: { email } })
    if (vorhanden) {
      return NextResponse.json(
        { fehler: "Diese E-Mail ist bereits registriert" },
        { status: 409 }
      )
    }

    // Passwort verschlüsseln (bcrypt macht es unknackbar)
    const passwortHash = await bcrypt.hash(passwort, 12)

    // User erstellen
    const user = await prisma.user.create({
      data: {
        vorname, nachname, email, passwortHash,
        telefon, strasse, hausnummer, plz, ort
      }
    })

    // Verifizierungs-E-Mail senden
    const token = crypto.randomBytes(32).toString("hex")
    // Token in DB speichern (vereinfacht - in Produktion eigene Tabelle)
    await prisma.einstellung.upsert({
      where: { schluessel: `verify_${user.id}` },
      update: { wert: token },
      create: { schluessel: `verify_${user.id}`, wert: token }
    })

    await sendVerificationEmail(email, token, vorname)

    return NextResponse.json({
      erfolg: true,
      nachricht: "Registrierung erfolgreich! Bitte E-Mail bestätigen."
    })

  } catch (error) {
    console.error("Registrierungsfehler:", error)
    return NextResponse.json(
      { fehler: "Serverfehler. Bitte später erneut versuchen." },
      { status: 500 }
    )
  }
}