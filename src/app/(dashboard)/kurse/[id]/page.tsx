// src/app/(dashboard)/kurse/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { GoogleMapsEmbed } from "@/components/kurs/GoogleMapsEmbed"
import { BuchungsButton } from "@/components/kurs/BuchungsButton"
import { auth } from "@/lib/auth"

export default async function KursDetailPage({
  params
}: {
  params: { id: string }
}) {
  // Kurs laden
  const kurs = await prisma.kurs.findUnique({
    where: { id: params.id, aktiv: true },
    include: {
      trainer: {
        include: {
          user: {
            select: { vorname: true, nachname: true, email: false }
          }
        }
      },
      buchungen: { where: { status: "BESTAETIGT" } }
    }
  })

  if (!kurs) notFound()

  // Eingeloggter User?
  const session = await auth()
  const user = session?.user

  // Hat User schon gebucht?
  let hatGebucht = false
  let userCredits = 0
  
  if (user) {
    const buchung = await prisma.buchung.findFirst({
      where: { userId: user.id, kursId: kurs.id }
    })
    hatGebucht = !!buchung
    
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true }
    })
    userCredits = dbUser?.credits || 0
  }

  const freieplaetze = kurs.maxTeilnehmer - kurs.buchungen.length
  const adresseKomplett = `${kurs.adresse}, ${kurs.plz} ${kurs.stadt}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        
        {/* Header */}
        <div className="bg-green-600 rounded-2xl p-8 text-white mb-8">
          <div className="text-sm opacity-80 mb-2">{kurs.kursart}</div>
          <h1 className="text-4xl font-bold mb-4">{kurs.titel}</h1>
          <div className="text-lg opacity-90">
            mit {kurs.trainer.user.vorname} {kurs.trainer.user.nachname}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Linke Spalte: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Beschreibung */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-bold text-lg mb-3">Über diesen Kurs</h2>
              <p className="text-gray-700 leading-relaxed">{kurs.beschreibung}</p>
            </div>

            {/* Karte */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-bold text-lg mb-3">📍 Treffpunkt</h2>
              <p className="text-gray-600 mb-4">{adresseKomplett}</p>
              <GoogleMapsEmbed adresse={adresseKomplett} />
            </div>
          </div>

          {/* Rechte Spalte: Buchungs-Box */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 sticky top-4">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {kurs.preisCredits} Credit
              </div>
              <div className="text-gray-500 text-sm mb-4">
                ≈ {kurs.preisEuro.toString()}€ Gegenwert
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div>📅 {format(new Date(kurs.startzeit), "dd. MMMM yyyy", { locale: de })}</div>
                <div>🕐 {format(new Date(kurs.startzeit), "HH:mm")} Uhr</div>
                <div>⏱️ {kurs.dauerMinuten} Minuten</div>
                <div>👥 {freieplaetze > 0 ? `${freieplaetze} Plätze frei` : "Ausgebucht"}</div>
              </div>

              <BuchungsButton
                kursId={kurs.id}
                freieplaetze={freieplaetze}
                hatGebucht={hatGebucht}
                userCredits={userCredits}
                istEingeloggt={!!user}
              />

              {user && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Dein Guthaben: {userCredits} Credits
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}