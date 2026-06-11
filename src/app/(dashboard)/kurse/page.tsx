import { prisma } from "@/lib/prisma"
import { KursKarte } from "@/components/kurs/KursKarte"
import { KursFilter } from "@/components/kurs/KursFilter"
import { Prisma } from "@prisma/client"

type SearchParams = {
  ort?: string
  kursart?: string
  datum?: string
}

export default async function KursePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams

  const filter: Prisma.KursWhereInput = {
    aktiv: true,
    abgesagt: false,
    startzeit: { gte: new Date() },
  }

  if (filters.ort) {
    filter.stadt = {
      contains: filters.ort,
      mode: "insensitive",
    }
  }

  if (filters.kursart) {
    filter.kursart = filters.kursart
  }

  if (filters.datum) {
    filter.startzeit = {
      gte: new Date(filters.datum),
    }
  }

  const kurse = await prisma.kurs.findMany({
    where: filter,
    include: {
      trainer: {
        include: {
          user: {
            select: { vorname: true, nachname: true },
          },
        },
      },
      buchungen: { where: { status: "BESTAETIGT" } },
    },
    orderBy: { startzeit: "asc" },
  })

  const kursartenRaw = await prisma.kurs.findMany({
    where: { aktiv: true },
    select: { kursart: true },
    distinct: ["kursart"],
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Outdoor-Kurse entdecken</h1>

      <p className="text-gray-600 mb-6">
        {kurse.length} Kurse verfügbar
      </p>

      <KursFilter
        kursarten={kursartenRaw.map((k) => k.kursart)}
        aktuelleFilter={filters}
      />

      {kurse.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">🌿</div>
          <p className="text-lg">
            Keine Kurse für diese Filter gefunden
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {kurse.map((kurs) => (
            <KursKarte
              key={kurs.id}
              kurs={kurs}
              gebuchteplaetze={kurs.buchungen.length}
            />
          ))}
        </div>
      )}
    </div>
  )
}