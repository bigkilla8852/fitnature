// src/app/api/zahlungen/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { auth } from "@/lib/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Credit-Pakete (anpassbar im Admin)
const CREDIT_PAKETE = [
  { credits: 1,  preis: 1000, label: "1 Credit (10€)" },   // Preis in Cent
  { credits: 5,  preis: 4500, label: "5 Credits (45€)" },
  { credits: 10, preis: 8000, label: "10 Credits (80€)" },
]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ fehler: "Nicht eingeloggt" }, { status: 401 })
  }

  const { paketIndex } = await req.json()
  const paket = CREDIT_PAKETE[paketIndex]

  if (!paket) {
    return NextResponse.json({ fehler: "Ungültiges Paket" }, { status: 400 })
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `FitNature Credits: ${paket.label}`,
            description: `${paket.credits} Kursbuchungs-Credit(s) für FitNature.net`
          },
          unit_amount: paket.preis
        },
        quantity: 1
      }],
      mode: "payment",
      // Nach Zahlung zurück zur App
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/credits?erfolg=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/credits?abgebrochen=true`,
      // User-ID im Metadaten speichern (für Webhook)
      metadata: {
        userId: session.user.id,
        credits: paket.credits.toString()
      },
      customer_email: session.user.email!
    })

    return NextResponse.json({ checkoutUrl: checkoutSession.url })

  } catch (error) {
    console.error("Stripe Fehler:", error)
    return NextResponse.json({ fehler: "Zahlungsfehler" }, { status: 500 })
  }
}