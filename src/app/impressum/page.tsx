// src/app/impressum/page.tsx
export default function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Impressum</h1>

      <div className="space-y-6 text-gray-700">
        <div>
          <h2 className="font-bold text-lg mb-2">Angaben gemäß § 5 TMG</h2>
          <p>
            my-IT-Solutions<br />
            Brühlstr. 32<br />
            71034 Böblingen
          </p>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-2">Kontakt</h2>
          <p>
            E-Mail:{" "}
            <a href="mailto:info@fitnature.net" className="text-green-600 underline">
              info@fitnature.net
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-2">Verantwortlich für den Inhalt</h2>
          <p>
            my-IT-Solutions<br />
            Brühlstr. 32<br />
            71034 Böblingen
          </p>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-2">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="mt-2">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-2">Haftungsausschluss</h2>
          <p>
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. 
            Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch 
            keine Gewähr übernehmen.
          </p>
        </div>
      </div>
    </div>
  )
}