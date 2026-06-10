-- CreateEnum
CREATE TYPE "Rolle" AS ENUM ('USER', 'TRAINER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TrainerStatus" AS ENUM ('AUSSTEHEND', 'GENEHMIGT', 'ABGELEHNT', 'GESPERRT');

-- CreateEnum
CREATE TYPE "BuchungsStatus" AS ENUM ('BESTAETIGT', 'WARTELISTE', 'STORNIERT', 'ABGESCHLOSSEN');

-- CreateEnum
CREATE TYPE "TransaktionsTyp" AS ENUM ('KAUF', 'BUCHUNG', 'STORNIERUNG', 'ADMIN_ANPASSUNG');

-- CreateEnum
CREATE TYPE "AuszahlungsStatus" AS ENUM ('AUSSTEHEND', 'VERARBEITUNG', 'BEZAHLT', 'ABGELEHNT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "vorname" TEXT NOT NULL,
    "nachname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "telefon" TEXT,
    "strasse" TEXT,
    "hausnummer" TEXT,
    "plz" TEXT,
    "ort" TEXT,
    "land" TEXT DEFAULT 'Deutschland',
    "passwortHash" TEXT NOT NULL,
    "rolle" "Rolle" NOT NULL DEFAULT 'USER',
    "credits" INTEGER NOT NULL DEFAULT 0,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "geloeschtAm" TIMESTAMP(3),
    "erstelltAm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualisiertAm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerProfil" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "qualifikation" TEXT,
    "qualifikationDatei" TEXT,
    "erfahrungJahre" INTEGER,
    "spezialisierung" TEXT[],
    "beschreibung" TEXT,
    "profilbild" TEXT,
    "status" "TrainerStatus" NOT NULL DEFAULT 'AUSSTEHEND',
    "freigegebenVon" TEXT,
    "freigegebenAm" TIMESTAMP(3),
    "gesamtEinnahmen" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ausstehendAuszahlung" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "erstelltAm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerProfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kurs" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "kursart" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "stadt" TEXT NOT NULL,
    "plz" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "startzeit" TIMESTAMP(3) NOT NULL,
    "endzeit" TIMESTAMP(3) NOT NULL,
    "dauerMinuten" INTEGER NOT NULL,
    "maxTeilnehmer" INTEGER NOT NULL,
    "preisCredits" INTEGER NOT NULL DEFAULT 1,
    "preisEuro" DECIMAL(10,2) NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "abgesagt" BOOLEAN NOT NULL DEFAULT false,
    "erstelltAm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualisiertAm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buchung" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kursId" TEXT NOT NULL,
    "status" "BuchungsStatus" NOT NULL DEFAULT 'BESTAETIGT',
    "wartelistePos" INTEGER,
    "erstelltAm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stornierungsgrund" TEXT,

    CONSTRAINT "Buchung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KreditTransaktion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "betrag" INTEGER NOT NULL,
    "typ" "TransaktionsTyp" NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "zahlungsId" TEXT,
    "zahlungsAnbieter" TEXT,
    "erstelltAm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KreditTransaktion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anfrage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefon" TEXT,
    "organisation" TEXT,
    "anfrageTyp" TEXT NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "wunschtermin" TIMESTAMP(3),
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEU',
    "adminNotiz" TEXT,
    "erstelltAm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anfrage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auszahlung" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "betrag" DECIMAL(10,2) NOT NULL,
    "status" "AuszahlungsStatus" NOT NULL DEFAULT 'AUSSTEHEND',
    "angefordertAm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bezahltAm" TIMESTAMP(3),
    "adminNotiz" TEXT,

    CONSTRAINT "Auszahlung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "aktion" TEXT NOT NULL,
    "zielTyp" TEXT NOT NULL,
    "zielId" TEXT NOT NULL,
    "details" TEXT,
    "erstelltAm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sitzung" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "smsCode" TEXT,
    "codeAblauf" TIMESTAMP(3),
    "codeVersuche" INTEGER NOT NULL DEFAULT 0,
    "erstelltAm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ablaufAm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sitzung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Einstellung" (
    "id" TEXT NOT NULL,
    "schluessel" TEXT NOT NULL,
    "wert" TEXT NOT NULL,
    "aktualisiertAm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Einstellung_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerProfil_userId_key" ON "TrainerProfil"("userId");

-- CreateIndex
CREATE INDEX "Kurs_startzeit_idx" ON "Kurs"("startzeit");

-- CreateIndex
CREATE INDEX "Kurs_stadt_idx" ON "Kurs"("stadt");

-- CreateIndex
CREATE INDEX "Kurs_kursart_idx" ON "Kurs"("kursart");

-- CreateIndex
CREATE INDEX "Buchung_userId_idx" ON "Buchung"("userId");

-- CreateIndex
CREATE INDEX "Buchung_kursId_idx" ON "Buchung"("kursId");

-- CreateIndex
CREATE UNIQUE INDEX "Buchung_userId_kursId_key" ON "Buchung"("userId", "kursId");

-- CreateIndex
CREATE INDEX "KreditTransaktion_userId_idx" ON "KreditTransaktion"("userId");

-- CreateIndex
CREATE INDEX "AdminLog_adminId_idx" ON "AdminLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminLog_erstelltAm_idx" ON "AdminLog"("erstelltAm");

-- CreateIndex
CREATE UNIQUE INDEX "Sitzung_token_key" ON "Sitzung"("token");

-- CreateIndex
CREATE INDEX "Sitzung_token_idx" ON "Sitzung"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Einstellung_schluessel_key" ON "Einstellung"("schluessel");

-- AddForeignKey
ALTER TABLE "TrainerProfil" ADD CONSTRAINT "TrainerProfil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kurs" ADD CONSTRAINT "Kurs_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buchung" ADD CONSTRAINT "Buchung_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buchung" ADD CONSTRAINT "Buchung_kursId_fkey" FOREIGN KEY ("kursId") REFERENCES "Kurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KreditTransaktion" ADD CONSTRAINT "KreditTransaktion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anfrage" ADD CONSTRAINT "Anfrage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auszahlung" ADD CONSTRAINT "Auszahlung_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sitzung" ADD CONSTRAINT "Sitzung_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
