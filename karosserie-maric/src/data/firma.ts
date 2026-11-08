/**
 * Alle Unternehmensangaben an einer Stelle.
 * Werte mit "[PLATZHALTER: …]" sind noch nicht bestätigt und müssen vor
 * dem Livegang ersetzt werden. Bitte nichts ergänzen, was der Kunde nicht
 * bestätigt hat.
 */

export const firma = {
  name: 'Karosserie-Maric',
  inhaber: 'Franjo Maric',
  strasse: 'Im Mönchgraben 39',
  plz: '75397',
  ort: 'Simmozheim',
  landkreis: 'Landkreis Calw',
  land: 'DE',
  telefon: '07033 309018',
  telefonHref: 'tel:+497033309018',
  telefonIntl: '+49 7033 309018',
  fax: '07033 309019',
  email: 'kontakt@karosserie-maric.de',
  domain: 'https://karosserie-maric.de',

  google: {
    sterne: '4,9',
    sterneZahl: 4.9,
    anzahl: 34,
    stand: '[PLATZHALTER: Datum der Abfrage, z. B. 11/2026]',
    // Link auf das Google-Unternehmensprofil. Sobald die genaue Profil-URL
    // vorliegt (Google Unternehmensprofil > Teilen), hier eintragen.
    url: 'https://www.google.com/maps/search/?api=1&query=Karosserie-Maric%2C+Im+M%C3%B6nchgraben+39%2C+75397+Simmozheim',
  },

  route: {
    google: 'https://www.google.com/maps/dir/?api=1&destination=Im+M%C3%B6nchgraben+39%2C+75397+Simmozheim',
    osm: 'https://www.openstreetmap.org/search?query=Im%20M%C3%B6nchgraben%2039%2C%2075397%20Simmozheim',
  },

  /**
   * Koordinaten für die Karte. Aktuell Ortsmitte Simmozheim (Näherung).
   * [PLATZHALTER: exakte Koordinaten der Werkstatt eintragen]
   */
  geo: { lat: 48.7497, lon: 8.8128, exakt: false },

  /** [PLATZHALTER: Öffnungszeiten] Format für JSON-LD: z. B. { tage: 'Mo–Fr', von: '07:30', bis: '17:00' } */
  oeffnungszeiten: [] as { tage: string; von: string; bis: string }[],

  region: [
    'Simmozheim',
    'Calw',
    'Weil der Stadt',
    'Althengstett',
    'Ostelsheim',
    'Gechingen',
    'Renningen',
    'Leonberg',
  ],
} as const;

export const P = (text: string) => `[PLATZHALTER: ${text}]`;
