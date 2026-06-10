// src/lib/email.ts
import nodemailer from "nodemailer"

// E-Mail-Versand einrichten
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
})

interface EmailOptionen {
  an: string
  betreff: string
  text: string
  html?: string
}

export async function sendeEmail(optionen: EmailOptionen) {
  try {
    await transporter.sendMail({
      from: `"FitNature.net" <info@fitnature.net>`,
      to: optionen.an,
      subject: optionen.betreff,
      text: optionen.text,
      html: optionen.html || optionen.text.replace(/\n/g, "<br>")
    })
    return true
  } catch (error) {
    console.error("E-Mail-Fehler:", error)
    return false
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  vorname: string
) {
  const url = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  
  await sendeEmail({
    an: email,
    betreff: "FitNature.net – E-Mail bestätigen",
    text: `Hallo ${vorname},\n\nbitte bestätige deine E-Mail-Adresse:\n${url}\n\nDer Link ist 24 Stunden gültig.\n\nDein FitNature-Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #16a34a;">🌿 FitNature.net</h2>
        <p>Hallo ${vorname},</p>
        <p>bitte bestätige deine E-Mail-Adresse:</p>
        <a href="${url}" style="
          background: #16a34a;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
          margin: 16px 0;
        ">E-Mail bestätigen</a>
        <p style="color: #6b7280; font-size: 12px;">
          Der Link ist 24 Stunden gültig. Falls du dich nicht registriert hast, ignoriere diese E-Mail.
        </p>
      </div>
    `
  })
}