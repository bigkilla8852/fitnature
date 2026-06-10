// src/app/(auth)/login/page.tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [schritt, setSchritt] = useState<"login" | "2fa">("login")
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState("")
  const [email, setEmail] = useState("")
  const [passwort, setPasswort] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [tempToken, setTempToken] = useState("")

  // Schritt 1: E-Mail + Passwort prüfen, dann SMS senden
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFehler("")
    setLaden(true)

    try {
      // Zuerst Zugangsdaten prüfen und SMS anfordern
      const antwort = await fetch("/api/auth/2fa/senden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passwort })
      })

      const daten = await antwort.json()

      if (!antwort.ok) {
        setFehler(daten.fehler || "Login fehlgeschlagen")
        return
      }

      setTempToken(daten.tempToken)
      setSchritt("2fa")

    } catch {
      setFehler("Netzwerkfehler")
    } finally {
      setLaden(false)
    }
  }

  // Schritt 2: SMS-Code bestätigen
  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setFehler("")
    setLaden(true)

    try {
      const antwort = await fetch("/api/auth/2fa/bestaetigen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, code: smsCode })
      })

      const daten = await antwort.json()

      if (!antwort.ok) {
        setFehler(daten.fehler || "Code ungültig")
        return
      }

      // Echten NextAuth-Login durchführen
      await signIn("credentials", {
        email,
        passwort,
        redirect: true,
        callbackUrl: "/dashboard"
      })

    } catch {
      setFehler("Fehler bei der Verifizierung")
    } finally {
      setLaden(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">🌿 FitNature</div>
          <CardTitle>
            {schritt === "login" ? "Einloggen" : "SMS-Code eingeben"}
          </CardTitle>
          {schritt === "2fa" && (
            <p className="text-sm text-gray-600 mt-2">
              Wir haben dir einen 6-stelligen Code per SMS gesendet.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {schritt === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {fehler && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {fehler}
                </div>
              )}
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email" type="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="passwort">Passwort</Label>
                <Input
                  id="passwort" type="password"
                  value={passwort} onChange={e => setPasswort(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={laden}
              >
                {laden ? "Wird geprüft..." : "Weiter →"}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Noch kein Konto?{" "}
                <Link href="/register" className="text-green-600 underline">
                  Jetzt registrieren
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handle2FA} className="space-y-4">
              {fehler && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {fehler}
                </div>
              )}
              <div>
                <Label htmlFor="smsCode">6-stelliger SMS-Code</Label>
                <Input
                  id="smsCode"
                  value={smsCode}
                  onChange={e => setSmsCode(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  className="text-center text-2xl tracking-widest"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Code gültig für 5 Minuten
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={laden}
              >
                {laden ? "Wird bestätigt..." : "Bestätigen"}
              </Button>
              <button
                type="button"
                onClick={() => setSchritt("login")}
                className="w-full text-sm text-gray-500 underline"
              >
                ← Zurück
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}