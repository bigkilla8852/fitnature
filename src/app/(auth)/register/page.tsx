// src/app/(auth)/register/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const router = useRouter()
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState("")
  
  // Formular-Daten
  const [formData, setFormData] = useState({
    vorname: "", nachname: "", email: "",
    passwort: "", passwortBestaetigung: "",
    telefon: "", strasse: "", hausnummer: "",
    plz: "", ort: "",
    datenschutzZustimmung: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFehler("")

    // Passwörter vergleichen
    if (formData.passwort !== formData.passwortBestaetigung) {
      setFehler("Passwörter stimmen nicht überein")
      return
    }

    if (!formData.datenschutzZustimmung) {
      setFehler("Bitte Datenschutzerklärung akzeptieren")
      return
    }

    setLaden(true)
    
    try {
      const antwort = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      const daten = await antwort.json()
      
      if (!antwort.ok) {
        setFehler(daten.fehler || "Fehler bei der Registrierung")
        return
      }
      
      // Weiterleitung zur Bestätigungsseite
      router.push("/register/bestaetigung")
      
    } catch {
      setFehler("Netzwerkfehler. Bitte erneut versuchen.")
    } finally {
      setLaden(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">🌿 FitNature</div>
          <CardTitle>Jetzt registrieren</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Fehlermeldung */}
            {fehler && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {fehler}
              </div>
            )}

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vorname">Vorname *</Label>
                <Input
                  id="vorname"
                  value={formData.vorname}
                  onChange={e => setFormData({...formData, vorname: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nachname">Nachname *</Label>
                <Input
                  id="nachname"
                  value={formData.nachname}
                  onChange={e => setFormData({...formData, nachname: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Kontakt */}
            <div>
              <Label htmlFor="email">E-Mail-Adresse *</Label>
              <Input
                id="email" type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="telefon">Telefonnummer (für 2FA) *</Label>
              <Input
                id="telefon" type="tel"
                placeholder="+4917612345678"
                value={formData.telefon}
                onChange={e => setFormData({...formData, telefon: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Wird für die SMS-Verifizierung beim Login benötigt
              </p>
            </div>

            {/* Adresse */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="strasse">Straße *</Label>
                <Input
                  id="strasse"
                  value={formData.strasse}
                  onChange={e => setFormData({...formData, strasse: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="hausnummer">Nr. *</Label>
                <Input
                  id="hausnummer"
                  value={formData.hausnummer}
                  onChange={e => setFormData({...formData, hausnummer: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="plz">PLZ *</Label>
                <Input
                  id="plz"
                  value={formData.plz}
                  onChange={e => setFormData({...formData, plz: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="ort">Ort *</Label>
                <Input
                  id="ort"
                  value={formData.ort}
                  onChange={e => setFormData({...formData, ort: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Passwort */}
            <div>
              <Label htmlFor="passwort">Passwort * (min. 8 Zeichen)</Label>
              <Input
                id="passwort" type="password"
                value={formData.passwort}
                onChange={e => setFormData({...formData, passwort: e.target.value})}
                required minLength={8}
              />
            </div>
            <div>
              <Label htmlFor="passwortBestaetigung">Passwort bestätigen *</Label>
              <Input
                id="passwortBestaetigung" type="password"
                value={formData.passwortBestaetigung}
                onChange={e => setFormData({...formData, passwortBestaetigung: e.target.value})}
                required
              />
            </div>

            {/* Datenschutz */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="datenschutz"
                checked={formData.datenschutzZustimmung}
                onChange={e => setFormData({...formData, datenschutzZustimmung: e.target.checked})}
                className="mt-1"
                required
              />
              <label htmlFor="datenschutz" className="text-sm text-gray-600">
                Ich stimme der{" "}
                <Link href="/datenschutz" className="text-green-600 underline">
                  Datenschutzerklärung
                </Link>{" "}
                zu und akzeptiere die Verarbeitung meiner Daten. *
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={laden}
            >
              {laden ? "Wird registriert..." : "Konto erstellen"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Bereits ein Konto?{" "}
              <Link href="/login" className="text-green-600 underline">
                Jetzt einloggen
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}