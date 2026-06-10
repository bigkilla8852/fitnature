// src/components/kurs/GoogleMapsEmbed.tsx
// Erklärt: Wir nutzen die einfache Embed-Variante von Google Maps.
// Das ist der einfachste Weg ohne komplexe SDK-Integration.

interface GoogleMapsEmbedProps {
  adresse: string
}

export function GoogleMapsEmbed({ adresse }: GoogleMapsEmbedProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  
  // URL-sichere Adresse erstellen
  const adresseEncoded = encodeURIComponent(adresse)
  
  // Embed-URL für Google Maps
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${adresseEncoded}&zoom=15&language=de`

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
      {apiKey ? (
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Karte: ${adresse}`}
        />
      ) : (
        // Fallback wenn kein API-Key
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-3xl mb-2">📍</div>
            <p>{adresse}</p>
          </div>
        </div>
      )}
    </div>
  )
}