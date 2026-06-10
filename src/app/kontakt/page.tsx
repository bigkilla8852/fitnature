// src/app/kontakt/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ANFRAGE_TYPEN = [
  "Kraft & Ausdauer",
  "Teambuilding",
  "Corporate Event",
  "Firmen-Wellness",
  "Vereinsangebot",
  "Privates Coaching",
  "Sonstiges"
]

export default function KontaktPage() {
  const [laden, setLaden] = useState(false)
  const [erfolg, setErfolg] = useState(false)
  const [fehler, setFehler] = useState("")

  const [formData, setFormData] = useState({
    name: "", email: "", telefon: "", organisation: "",
    anfrageTyp: "", beschreibung: "", wunschtermin: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLaden(true)
    setFehler("")

    try {
      const antwort = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!antwort.ok) throw new Error("Fehler beim Senden")
      setErfolg(true)

    } catch {
      setFehler("Anfrage konnte nicht gesendet werden. Bitte erneut versuchen.")
    } finally {
      setLaden(false)
    }
  }

  if (erfolg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Anfrage gesendet!</h2>
          <p className="text-gray-600">
            Wir haben deine Anfrage erhalten und melden uns innerhalb von
            2 Werktagen bei dir. Du erhältst auch eine Bestätigung an deine E-Mail-Adresse.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kontakt aufnehmen</h1>
          <p className="text-gray-600">
            Für Unternehmen, Vereine und Privatpersonen – wir erstellen ein individuelles Angebot.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {fehler && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {fehler}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email" type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefon">Telefon</Label>
                  <Input
                    id="telefon"
                    value={formData.telefon}
                    onChange={e => setFormData({...formData, telefon: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="organisation">Organisation (optional)</Label>
                  <Input
                    id="organisation"
                    placeholder="Firma, Verein, ..."
                    value={formData.organisation}
                    onChange={e => setFormData({...formData, organisation: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="anfrageTyp">Art der Anfrage *</Label>
                <select
                  id="anfrageTyp"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={formData.anfrageTyp}
                  onChange={e => setFormData({...formData, anfrageTyp: e.target.value})}
                  required
                >
                  <option value="">Bitte wählen...</option>
                  {ANFRAGE_TYPEN.map(typ => (
                    <option key={typ} value={typ}>{typ}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="beschreibung">Beschreibung *</Label>
                <textarea
                  id="beschreibung"
                  className="w-full border rounded-lg p-2 text-sm min-h-[120px]"
                  placeholder="Was können wir für dich tun? Gruppengrößen, besondere Anforderungen, etc."
                  value={formData.beschreibung}
                  onChange={e => setFormData({...formData, beschreibung: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="wunschtermin">Wunschtermin (optional)</Label>
                <Input
                  id="wunschtermin" type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.wunschtermin}
                  onChange={e => setFormData({...formData, wunschtermin: e.target.value})}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={laden}
              >
                {laden ? "Wird gesendet..." : "Anfrage senden"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Deine Daten werden gemäß unserer{" "}
                <a href="/datenschutz" className="underline">Datenschutzerklärung</a>{" "}
                verarbeitet und ausschließlich für die Bearbeitung deiner Anfrage verwendet.
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Direkter Kontakt: <a href="mailto:info@fitnature.net" className="text-green-600">info@fitnature.net</a></p>
        </div>
      </div>
    </div>
  )
}