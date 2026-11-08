# Karosserie Maric · One-Pager

Statische Website für Karosserie-Maric, Simmozheim. Gebaut mit Astro und für das Hosting auf Cloudflare Pages ausgelegt.

## Entwicklung

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # Ausgabe in dist/
```

Node.js ≥ 22.

## Deployment auf Cloudflare Pages

1. Repository in Cloudflare Pages verbinden.
   - Root directory: `karosserie-maric`
   - Build command: `npm run build`
   - Build output directory: `dist`
2. Umgebungsvariablen (Settings > Variables and Secrets, als **Secret**):
   - `BREVO_API_KEY`: API-Schlüssel von Brevo (Transaktions-E-Mail, Server in der EU)
   - `MAIL_TO`: `kontakt@karosserie-maric.de`
   - `MAIL_FROM`: bei Brevo verifizierte Absenderadresse, z. B. `formular@karosserie-maric.de` (SPF/DKIM für die Domain bei Brevo einrichten)
3. Eigene Domain `karosserie-maric.de` verbinden, alte WordPress-Installation abschalten.
4. Mit Brevo einen Vertrag zur Auftragsverarbeitung abschließen (im Brevo-Konto). Mit Cloudflare ebenso (DPA im Dashboard).

Ein anderer Mail-Dienst ist möglich. Dann `functions/api/anfrage.js` und die Datenschutzerklärung anpassen.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/data/firma.ts` | Alle Firmendaten an einer Stelle (Telefon, Adresse, Google-Wertung, Koordinaten, Öffnungszeiten) |
| `src/components/` | Abschnitte der Startseite |
| `src/pages/` | Startseite, Impressum, Datenschutz, Formular-Rückmeldungen, 404 |
| `src/scripts/` | Wenig JavaScript: Vorher/Nachher-Regler, Zwei-Klick-Karte, Formularprüfung |
| `functions/api/anfrage.js` | Formularversand mit Foto-Upload (Cloudflare Pages Function) |
| `public/_headers` | Sicherheits-Header (CSP ohne `unsafe-inline`, HSTS, usw.) |
| `public/fonts/` | Archivo und IBM Plex Sans als WOFF2, lokal (keine Google-Fonts-Verbindung) |

## Fotos einsetzen

1. Originalfotos (mindestens 2000 px breit, JPG) nach `src/assets/fotos/` legen.
2. In der jeweiligen Komponente importieren und an `<Bildplatz src={…} alt="…">` übergeben:
   - `Hero.astro`: Werkstattfoto, 4:5 hoch
   - `src/data/vorher-nachher.ts`: 2 bis 4 Paare, 3:2 quer, gleiche Perspektive
   - `UeberUns.astro`: Team, 4:3 quer
3. Astro erzeugt beim Build automatisch AVIF und WebP in passenden Größen.

Keine KI-generierten Fotos, keine Stockfotos von Werkstätten.

## Platzhalter und fertige Ansicht

Standardmäßig (`npm run dev`, `npm run build`) zeigt die Seite nur bestätigte Angaben und wirkt fertig. Alles, wofür noch Material fehlt, ist ausgeblendet:

- Bildflächen in Hero und „Über uns“ (Text läuft dann über die volle Breite)
- Abschnitt Vorher/Nachher samt Menüpunkt (erscheint, sobald ein Paar beide Fotos hat)
- Bewertungszitate, Stand der Google-Wertung, Merkmale in der Vertrauensleiste
- Öffnungszeiten, Gründungsjahr, Meisterbetrieb, Werdegang, Leistung 04

Alle offenen Stellen gelb markiert anzeigen:

```bash
npm run dev:platzhalter
npm run build:platzhalter
```

Echte Angaben trägst du ein in `src/data/firma.ts` (`merkmale`, `oeffnungszeitenText`, `oeffnungszeiten`, `google.stand`, `geo`), `src/data/vorher-nachher.ts`, `src/components/UeberUns.astro` (`werdegang`, `gegruendet`, `meisterbetrieb`) und `src/components/Bewertungen.astro`. Dann erscheinen die Abschnitte automatisch.

Impressum und Datenschutz zeigen ihre Platzhalter immer, weil dort Pflichtangaben fehlen. Vor dem Livegang muss

```bash
grep -rn "PLATZHALTER" src/pages/
```

leer sein.

## Sicherheit

- Keine Datenbank, kein CMS, kein Login: keine Angriffsfläche wie bei WordPress.
- CSP erlaubt nur eigene Skripte, Styles und Schriften. Einzige Ausnahme: OpenStreetMap als iframe nach Klick.
- Das Formular prüft Eingaben im Browser und erneut auf dem Server: Längen, Telefonformat, höchstens 4 Fotos, Dateityp anhand der Bytes (nur JPG/PNG), Größenlimits, Origin-Prüfung, Honeypot gegen Bots. Dateinamen werden nicht übernommen. Es wird nichts gespeichert.
- Kein Tracking, keine Cookies, kein Cookie-Banner nötig.
