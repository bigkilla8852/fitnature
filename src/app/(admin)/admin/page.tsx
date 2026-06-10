// src/app/(admin)/admin/page.tsx
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminPage() {
  // Alle wichtigen Zahlen auf einen Blick
  const [
    userAnzahl,
    trainerAusstehend,
    buchungenHeute,
    offeneAnfragen,
  ] = await Promise.all([
    prisma.user.count({ where: { aktiv: true } }),
    prisma.trainerProfil.count({ where: { status: "AUSSTEHEND" } }),
    prisma.buchung.count({
      where: {
        erstelltAm: { gte: new Date(new Date().setHours(0,0,0,0)) }
      }
    }),
    prisma.anfrage.count({ where: { status: "NEU" } })
  ])

  // Ausstehende Trainer
  const ausstehendTrainer = await prisma.trainerProfil.findMany({
    where: { status: "AUSSTEHEND" },
    include: {
      user: { select: { vorname: true, nachname: true, email: true, erstelltAm: true } }
    },
    orderBy: { erstelltAm: "asc" }
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Admin-Übersicht</h1>

        {/* Schnellübersicht */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Nutzer gesamt", wert: userAnzahl, farbe: "blue" },
            { label: "Trainer ausstehend", wert: trainerAusstehend, farbe: "orange" },
            { label: "Buchungen heute", wert: buchungenHeute, farbe: "green" },
            { label: "Offene Anfragen", wert: offeneAnfragen, farbe: "red" },
          ].map(karte => (
            <div key={karte.label} className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className={`text-3xl font-bold text-${karte.farbe}-600`}>
                {karte.wert}
              </div>
              <div className="text-sm text-gray-500">{karte.label}</div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { href: "/admin/trainer", label: "🧑‍🏫 Trainer verwalten" },
            { href: "/admin/buchungen", label: "📋 Buchungen" },
            { href: "/admin/anfragen", label: "📨 Kontaktanfragen" },
            { href: "/admin/auszahlungen", label: "💰 Auszahlungen" },
            { href: "/admin/kurse", label: "🏃 Kurse verwalten" },
            { href: "/admin/nutzer", label: "👥 Nutzer verwalten" },
            { href: "/admin/einstellungen", label: "⚙️ Einstellungen" },
            { href: "/admin/dsgvo", label: "🔒 DSGVO & Datenschutz" },
          ].map(nav => (
            <Link
              key={nav.href}
              href={nav.href}
              className="bg-white hover:bg-gray-50 rounded-xl p-4 shadow-sm text-center font-medium transition-colors"
            >
              {nav.label}
            </Link>
          ))}
        </div>

        {/* Ausstehende Trainer-Freigaben */}
        {ausstehendTrainer.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-4">
              ⏳ Trainer warten auf Freigabe ({ausstehendTrainer.length})
            </h2>
            <div className="space-y-3">
              {ausstehendTrainer.map(trainer => (
                <div
                  key={trainer.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {trainer.user.vorname} {trainer.user.nachname}
                    </div>
                    <div className="text-sm text-gray-500">
                      {trainer.user.email} •{" "}
                      {trainer.spezialisierung.join(", ")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/trainer/${trainer.id}`}>
                      <Button size="sm" variant="outline">Details</Button>
                    </Link>
                    <form action={`/api/admin/trainer/${trainer.id}/freigeben`} method="POST">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        ✓ Freigeben
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}