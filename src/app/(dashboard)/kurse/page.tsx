import { prisma } from "@/lib/prisma"
import { KursKarte } from "@/components/kurs/KursKarte"
import { KursFilter } from "@/components/kurs/KursFilter"
import { Prisma } from "@prisma/client"

export default async function KursePage({
  searchParams
}: {
  searchParams: { ort?: string; kursart?: string; datum?: string }
}) {

  const filter: Prisma.KursWhereInput = {
    aktiv: true,
    abgesagt: false,
    startzeit: { gte: new Date() }
  }

  if (searchParams.ort) {
    filter.stadt = { contains: searchParams.ort, mode: "insensitive" }
  }
  if (searchParams.kursart) {
    filter.kursart = searchParams.kursart
  }
  if (searchParams.datum) {
    filter.startzeit = { gte: new Date(searchParams.datum) }
  }

  const kurse = await prisma.kurs.findMany({
    where: filter,
    include: {
      trainer: {
        include: { user: { select: { vorname: true, nachname: true } } }
      },
      buchungen: { where: { status: "BESTAETIGT" } }
    },
    orderBy: { startzeit: "asc" }
  })

  const kursartenRaw = await prisma.kurs.findMany({
    where: { aktiv: true },
    select: { kursart: true },
    distinct: ["kursart"]
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Outdoor-Kurse entdecken
        </h1>
        <p className="text-gray-600 mb-6">
          {kurse.length} Kurse verfügbar
        </p>

        <KursFilter
          kursarten={kursartenRaw.map(k => k.kursart)}
          aktuelleFilter={searchParams}
        />

        {kurse.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">🌿</div>
            <p className="text-lg">Keine Kurse für diese Filter gefunden</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {kurse.map(kurs => (
              <KursKarte
                key={kurs.id}
                kurs={kurs}
                gebuchteplaetze={kurs.buchungen.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
