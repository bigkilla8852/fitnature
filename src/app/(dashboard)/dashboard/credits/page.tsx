"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const PAKETE = [
  { credits: 1,  preis: "10€",  label: "Einzel",  beliebt: false },
  { credits: 5,  preis: "45€",  label: "Starter", beliebt: true  },
  { credits: 10, preis: "80€",  label: "Pro",      beliebt: false },
]

export default function CreditsPage() {
  const [laden, setLaden] = useState<number | null>(null)
  const [zahlungsart, setZahlungsart] = useState<"stripe" | "paypal">("stripe")

  const handleKauf = async (paketIndex: number) => {
    setLaden(paketIndex)
    try {
      const endpoint = zahlungsart === "stripe"
        ? "/api/zahlungen/stripe/checkout"
        : "/api/zahlungen/paypal/checkout"

      const antwort = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paketIndex })
      })

      const daten = await antwort.json()
      const url: string | undefined = daten.checkoutUrl || daten.approveUrl

      if (url) {
        // Router-Navigation statt window.location
        window.location.assign(url)
      }
    } catch {
      alert("Zahlungsfehler. Bitte erneut versuchen.")
    } finally {
      setLaden(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Credits kaufen</h1>
      <p className="text-gray-600 mb-6">
        1 Credit = 1 Kursbuchung. Credits verfallen nicht.
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setZahlungsart("stripe")}
          className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
            zahlungsart === "stripe"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-gray-200"
          }`}
        >
          💳 Kreditkarte (Stripe)
        </button>
        <button
          onClick={() => setZahlungsart("paypal")}
          className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
            zahlungsart === "paypal"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-200"
          }`}
        >
          🅿️ PayPal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PAKETE.map((paket, index) => (
          <Card
            key={index}
            className={`relative ${paket.beliebt ? "border-green-500 border-2" : ""}`}
          >
            {paket.beliebt && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                Beliebt
              </div>
            )}
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-1">
                {paket.credits}
              </div>
              <div className="text-gray-500 mb-2">
                {paket.credits === 1 ? "Credit" : "Credits"}
              </div>
              <div className="text-2xl font-bold mb-1">{paket.preis}</div>
              <div className="text-xs text-gray-400 mb-4">
                {(Number(paket.preis.replace("€", "")) / paket.credits).toFixed(2)}€ / Credit
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleKauf(index)}
                disabled={laden === index}
              >
                {laden === index ? "Weiterleitung..." : `${paket.preis} zahlen`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
