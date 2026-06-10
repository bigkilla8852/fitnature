// src/app/(trainer)/trainer/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export default async function TrainerDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // Trainer-Profil laden
  const trainer = await prisma.trainerProfil.findUnique({
    where: { userId: session.user.id },
    include: {
      kurse: {
        include: {
          buchungen: { where: { status: "BESTAETIGT" } }
        },
        orderBy: { startzeit: "asc" }
      }
    }
  })

  if (!trainer) redirect("/trainer/registrierung")
  if (trainer.status !== "GENEHMIGT") {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-2">Profil wird geprüft</h1>
        <p className="text-gray-600">
          Dein Trainer-Profil wurde eingereicht und wird von unserem Team geprüft.
          Du erhältst eine E-Mail-Benachrichtigung sobald dein Profil freigegeben wird.
        </p>
      </div>
    )
  }

  // Statistiken berechnen
  const jetzt = new Date()
  const naechsteKurse = trainer.kurse.filter(k => new Date(k.startzeit) > jetzt)
  const vergangeneKurse = trainer.kurse.filter(k => new Date(k.startzeit) <= jetzt)

  const gesamtTeilnehmer = trainer.kurse.reduce(
    (sum, k) => sum + k.buchungen.length, 0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6">Trainer-Dashboard</h1>

        {/* Statistik-Karten */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">
              {Number(trainer.gesamtEinnahmen).toFixed(2)}€
            </div>
            <div className="text-sm text-gray-500">Gesamteinnahmen</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-500">
              {Number(trainer.ausstehendAuszahlung).toFixed(2)}€
            </div>
            <div className="text-sm text-gray-500">Ausstehend</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600">
              {trainer.kurse.length}
            </div>
            <div className="text-sm text-gray-500">Kurse gesamt</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-purple-600">
              {gesamtTeilnehmer}
            </div>
            <div className="text-sm text-gray-500">Teilnehmer gesamt</div>
          </div>
        </div>

        {/* Revenue-Share Erklärung */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm">
          <strong>💰 Revenue-Share:</strong> Du erhältst 40% des Kursumsatzes.
          Beispiel: 20 Teilnehmer × 10€ = 200€ → Dein Anteil: 80€
        </div>

        {/* Nächste Kurse */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Nächste Kurse</h2>
            <a
              href="/trainer/kurse/neu"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              + Neuer Kurs
            </a>
          </div>

          {naechsteKurse.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Noch keine zukünftigen Kurse.{" "}
              <a href="/trainer/kurse/neu" className="text-green-600 underline">
                Ersten Kurs erstellen →
              </a>
            </p>
          ) : (
            <div className="space-y-3">
              {naechsteKurse.map(kurs => {
                const auslastung = Math.round(
                  (kurs.buchungen.length / kurs.maxTeilnehmer) * 100
                )
                const einnahmen = kurs.buchungen.length * Number(kurs.preisEuro) * 0.4

                return (
                  <div
                    key={kurs.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{kurs.titel}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(kurs.startzeit), "dd.MM.yyyy HH:mm", { locale: de })} •{" "}
                        {kurs.buchungen.length}/{kurs.maxTeilnehmer} Teilnehmer ({auslastung}%)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {einnahmen.toFixed(2)}€
                      </div>
                      <div className="text-xs text-gray-400">dein Anteil</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}