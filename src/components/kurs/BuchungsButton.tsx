// src/components/kurs/BuchungsButton.tsx
// Erklärt: Dieser Button hat verschiedene Zustände, abhängig davon:
// - Ist der User eingeloggt?
// - Hat er schon gebucht?
// - Hat er genug Credits?
// - Gibt es noch freie Plätze?
// Je nach Zustand zeigt er etwas anderes an.

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface BuchungsButtonProps {
  kursId: string
  freieplaetze: number
  hatGebucht: boolean
  userCredits: number
  istEingeloggt: boolean
}

export function BuchungsButton({
  kursId,
  freieplaetze,
  hatGebucht,
  userCredits,
  istEingeloggt,
}: BuchungsButtonProps) {
  const router = useRouter()
  const [laden, setLaden] = useState(false)
  const [dialogOffen, setDialogOffen] = useState(false)
  const [ergebnis, setErgebnis] = useState<{
    erfolg: boolean
    nachricht: string
    aufWarteliste?: boolean
  } | null>(null)

  // ─── Zustand 1: Bereits gebucht ───
  if (hatGebucht) {
    return (
      <div className="w-full text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 font-medium text-sm">
          ✅ Du hast diesen Kurs gebucht
        </div>
        <button
          onClick={() => router.push("/dashboard/buchungen")}
          className="mt-2 text-xs text-gray-500 underline hover:text-gray-700"
        >
          Meine Buchungen ansehen →
        </button>
      </div>
    )
  }

  // ─── Zustand 2: Nicht eingeloggt ───
  if (!istEingeloggt) {
    return (
      <div className="w-full space-y-2">
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => router.push(`/login?weiter=/kurse/${kursId}`)}
        >
          🔐 Einloggen & buchen
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Noch kein Konto?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-green-600 underline"
          >
            Jetzt registrieren
          </button>
        </p>
      </div>
    )
  }

  // ─── Zustand 3: Nicht genug Credits (aber eingeloggt) ───
  if (userCredits < 1 && freieplaetze > 0) {
    return (
      <div className="w-full space-y-2">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
          ⚠️ Du hast keine Credits mehr.
        </div>
        <Button
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          onClick={() => router.push("/dashboard/credits")}
        >
          💳 Credits kaufen
        </Button>
      </div>
    )
  }

  // ─── Buchung durchführen ───
  const handleBuchen = async () => {
    setLaden(true)
    try {
      const antwort = await fetch("/api/buchungen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kursId }),
      })

      const daten = await antwort.json()

      if (!antwort.ok) {
        setErgebnis({ erfolg: false, nachricht: daten.fehler || "Buchung fehlgeschlagen" })
      } else {
        setErgebnis({
          erfolg: true,
          aufWarteliste: daten.aufWarteliste,
          nachricht: daten.aufWarteliste
            ? "Du stehst jetzt auf der Warteliste! Wir benachrichtigen dich per E-Mail, sobald ein Platz frei wird."
            : "Buchung erfolgreich! Du erhältst in Kürze eine Bestätigungs-E-Mail.",
        })
        // Seite neu laden damit Platzanzeige aktuell ist
        router.refresh()
      }
    } catch {
      setErgebnis({ erfolg: false, nachricht: "Netzwerkfehler. Bitte erneut versuchen." })
    } finally {
      setLaden(false)
      setDialogOffen(true)
    }
  }

  // ─── Zustand 4: Ausgebucht → Warteliste ───
  if (freieplaetze <= 0) {
    return (
      <>
        <Button
          className="w-full bg-gray-600 hover:bg-gray-700"
          onClick={handleBuchen}
          disabled={laden}
        >
          {laden ? "Wird eingetragen..." : "📋 Auf Warteliste eintragen"}
        </Button>

        <ErgebnisDialog
          offen={dialogOffen}
          onSchliessen={() => {
            setDialogOffen(false)
            if (ergebnis?.erfolg) router.push("/dashboard/buchungen")
          }}
          ergebnis={ergebnis}
        />
      </>
    )
  }

  // ─── Zustand 5: Normal buchbar ───
  return (
    <>
      <Button
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
        onClick={handleBuchen}
        disabled={laden}
      >
        {laden ? "Wird gebucht..." : "🏃 Jetzt buchen – 1 Credit"}
      </Button>

      <ErgebnisDialog
        offen={dialogOffen}
        onSchliessen={() => {
          setDialogOffen(false)
          if (ergebnis?.erfolg) router.push("/dashboard/buchungen")
        }}
        ergebnis={ergebnis}
      />
    </>
  )
}

// ─── Bestätigungs-Dialog ───
// Erklärt: Nach der Buchung zeigen wir ein Popup mit dem Ergebnis.
function ErgebnisDialog({
  offen,
  onSchliessen,
  ergebnis,
}: {
  offen: boolean
  onSchliessen: () => void
  ergebnis: { erfolg: boolean; nachricht: string; aufWarteliste?: boolean } | null
}) {
  if (!ergebnis) return null

  return (
    <Dialog open={offen} onOpenChange={onSchliessen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {ergebnis.erfolg
              ? ergebnis.aufWarteliste
                ? "📋 Warteliste"
                : "✅ Gebucht!"
              : "❌ Fehler"}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {ergebnis.nachricht}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {ergebnis.erfolg && !ergebnis.aufWarteliste && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={onSchliessen}
            >
              Meine Buchungen ansehen
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={onSchliessen}>
            {ergebnis.erfolg ? "Schließen" : "Erneut versuchen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}