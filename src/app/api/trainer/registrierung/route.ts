// src/app/api/trainer/registrierung/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ fehler: "Nicht eingeloggt" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const qualifikation = formData.get("qualifikation") as string
    const erfahrungJahre = parseInt(formData.get("erfahrungJahre") as string)
    const spezialisierungRaw = formData.get("spezialisierung") as string
    const spezialisierung = spezialisierungRaw.split(",").map(s => s.trim())
    const beschreibung = formData.get("beschreibung") as string

    // Datei-Upload (vereinfacht - in Produktion zu Cloudinary/S3)
    const datei = formData.get("qualifikationDatei") as File
    let dateipfad = null
    if (datei) {
      // TODO: Datei zu Speicherdienst hochladen
      dateipfad = `uploads/${datei.name}`
    }

    // Trainer-Profil erstellen
    await prisma.trainerProfil.create({
      data: {
        userId: session.user.id,
        qualifikation,
        erfahrungJahre,
        spezialisierung,
        beschreibung,
        qualifikationDatei: dateipfad,
        status: "AUSSTEHEND"
      }
    })

    // User-Rolle zu TRAINER ändern (noch ausstehend)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { rolle: "TRAINER" }
    })

    // Admin benachrichtigen
    await fetch("/api/intern/admin-benachrichtigung", {
      method: "POST",
      body: JSON.stringify({
        betreff: "Neuer Trainer wartet auf Freigabe",
        userId: session.user.id
      })
    })

    return NextResponse.json({
      erfolg: true,
      nachricht: "Antrag eingereicht! Wir prüfen dein Profil und melden uns per E-Mail."
    })

  } catch (error) {
    return NextResponse.json({ fehler: "Fehler beim Einreichen" }, { status: 500 })
  }
}