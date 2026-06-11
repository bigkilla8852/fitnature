// src/app/api/zahlungen/paypal/checkout/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const PAYPAL_API = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com"

const CREDIT_PAKETE = [
  { credits: 1,  preis: "10.00" },
  { credits: 5,  preis: "45.00" },
  { credits: 10, preis: "80.00" },
]

// PayPal Access Token holen
async function getPayPalToken(): Promise<string> {
  const antwort = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
      ).toString("base64")}`
    },
    body: "grant_type=client_credentials"
  })
  const daten = await antwort.json()
  return daten.access_token
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ fehler: "Nicht eingeloggt" }, { status: 401 })
  }

  const { paketIndex } = await req.json()
  const paket = CREDIT_PAKETE[paketIndex]

  try {
    const token = await getPayPalToken()

    const bestellung = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "EUR",
            value: paket.preis
          },
          description: `FitNature: ${paket.credits} Credit(s)`,
          custom_id: `${session.user.id}:${paket.credits}` // user:credits
        }],
        application_context: {
          return_url: `${process.env.NEXTAUTH_URL}/api/zahlungen/paypal/erfolg`,
          cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/credits?abgebrochen=true`
        }
      })
    })
    type PayPalLink = {
      rel: string
      href: string
    }
    const bestellDaten = await bestellung.json()
    const approveUrl = bestellDaten.links?.find(
      (l: PayPalLink) => l.rel === "approve"
    )?.href

    return NextResponse.json({ approveUrl })

  } catch (error) {
    console.error("PayPal Fehler:", error)
    return NextResponse.json({ fehler: "PayPal-Fehler" }, { status: 500 })
  }
}