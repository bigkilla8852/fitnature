// src/app/api/zahlungen/stripe/webhook/route.ts
// Erklärt: Stripe ruft diese URL auf, wenn eine Zahlung erfolgreich war.
// So kriegen wir mit, dass Credits gutgeschrieben werden sollen.

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signatur = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    // Sicherheitsprüfung: Kommt die Anfrage wirklich von Stripe?
    event = stripe.webhooks.constructEvent(
      body,
      signatur,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ fehler: "Webhook ungültig" }, { status: 400 })
  }

  // Zahlung erfolgreich?
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits || "0")

    if (userId && credits > 0) {
      await prisma.$transaction(async (tx) => {
        // Credits gutschreiben
        await tx.user.update({
          where: { id: userId },
          data: { credits: { increment: credits } }
        })

        // Transaktion protokollieren
        await tx.kreditTransaktion.create({
          data: {
            userId,
            betrag: credits,
            typ: "KAUF",
            beschreibung: `${credits} Credits via Stripe gekauft`,
            zahlungsId: session.payment_intent as string,
            zahlungsAnbieter: "stripe"
          }
        })
      })
    }
  }

  return NextResponse.json({ empfangen: true })
}