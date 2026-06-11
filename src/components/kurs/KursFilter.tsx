// src/components/kurs/KursFilter.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface KursFilterProps {
  kursarten: string[]
  aktuelleFilter: {
    ort?: string
    kursart?: string
    datum?: string
  }
}

export function KursFilter({ kursarten, aktuelleFilter }: KursFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilter = (key: string, value: string) => {
    // Aktuelle URL-Parameter kopieren
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/kurse?${params.toString()}`)
  }

  const alleZuruecksetzen = () => {
    router.push("/kurse")
  }

  const hatAktiveFilter =
    aktuelleFilter.ort || aktuelleFilter.kursart || aktuelleFilter.datum

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap gap-3 items-end">

        {/* Ort-Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Ort
          </label>
          <input
            type="text"
            placeholder="z.B. Stuttgart"
            defaultValue={aktuelleFilter.ort || ""}
            onChange={e => setFilter("ort", e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Kursart-Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Kursart
          </label>
          <select
            value={aktuelleFilter.kursart || ""}
            onChange={e => setFilter("kursart", e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Alle Kursarten</option>
            {kursarten.map(art => (
              <option key={art} value={art}>
                {art}
              </option>
            ))}
          </select>
        </div>

        {/* Datum-Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Ab Datum
          </label>
          <input
            type="date"
            value={aktuelleFilter.datum || ""}
            min={new Date().toISOString().split("T")[0]}
            onChange={e => setFilter("datum", e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Filter zurücksetzen */}
        {hatAktiveFilter && (
          <button
            onClick={alleZuruecksetzen}
            className="px-3 py-2 text-sm text-gray-500 hover:text-red-500 underline"
          >
            ✕ Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Aktive Filter anzeigen */}
      {hatAktiveFilter && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {aktuelleFilter.ort && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
              📍 {aktuelleFilter.ort}
            </span>
          )}
          {aktuelleFilter.kursart && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
              🏃 {aktuelleFilter.kursart}
            </span>
          )}
          {aktuelleFilter.datum && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
              📅 ab {aktuelleFilter.datum}
            </span>
          )}
        </div>
      )}
    </div>
  )
}