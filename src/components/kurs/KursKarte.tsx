// src/components/kurs/KursKarte.tsx
import Link from "next/link"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { MapPin, Clock, Users, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface KursKarteProps {
  kurs: {
    id: string
    titel: string
    kursart: string
    beschreibung: string
    stadt: string
    startzeit: Date
    dauerMinuten: number
    maxTeilnehmer: number
    preisCredits: number
    trainer: {
      user: { vorname: string; nachname: string }
    }
  }
  gebuchteplaetze: number
}

export function KursKarte({ kurs, gebuchteplaetze }: KursKarteProps) {
  const freieplaetze = kurs.maxTeilnehmer - gebuchteplaetze
  const istAusgebucht = freieplaetze <= 0

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Kurs-Typ Badge */}
      <div className="bg-green-600 p-4 text-white">
        <Badge variant="secondary" className="mb-2 bg-white text-green-700">
          {kurs.kursart}
        </Badge>
        <h3 className="font-bold text-lg leading-tight">{kurs.titel}</h3>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Trainer */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>
            {kurs.trainer.user.vorname} {kurs.trainer.user.nachname}
          </span>
        </div>

        {/* Ort */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-green-600" />
          <span>{kurs.stadt}</span>
        </div>

        {/* Datum & Uhrzeit */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-green-600" />
          <span>
            {format(new Date(kurs.startzeit), "dd. MMM yyyy, HH:mm", { locale: de })}
            {" "}Uhr ({kurs.dauerMinuten} Min.)
          </span>
        </div>

        {/* Plätze */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-green-600" />
          <span className={istAusgebucht ? "text-red-500 font-medium" : "text-gray-600"}>
            {istAusgebucht
              ? "Ausgebucht (Warteliste möglich)"
              : `${freieplaetze} von ${kurs.maxTeilnehmer} Plätzen frei`
            }
          </span>
        </div>

        {/* Preis & Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xl font-bold text-green-600">
            {kurs.preisCredits} Credit
          </div>
          <Link href={`/kurse/${kurs.id}`}>
            <Button
              size="sm"
              className={istAusgebucht
                ? "bg-gray-400 hover:bg-gray-500"
                : "bg-green-600 hover:bg-green-700"
              }
            >
              {istAusgebucht ? "Warteliste" : "Details →"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}