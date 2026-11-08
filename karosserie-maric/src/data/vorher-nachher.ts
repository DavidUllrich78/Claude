import type { ImageMetadata } from 'astro';

/*
 * 2 bis 4 Bildpaare. Beide Fotos eines Paares aus derselben Position,
 * gleicher Ausschnitt, Format 3:2 quer. Fotos nach src/assets/fotos/ legen
 * und hier importieren, z. B.:
 *   import vorher1 from '../assets/fotos/paar1-vorher.jpg';
 * Ein Paar erscheint auf der Seite erst, wenn beide Fotos eingetragen sind.
 */
export type Paar = {
  titel: string;
  vorher?: ImageMetadata;
  nachher?: ImageMetadata;
  altVorher: string;
  altNachher: string;
};

export const allePaare: Paar[] = [
  {
    titel: '[PLATZHALTER: Fahrzeug und Schaden, z. B. Kompaktwagen, Seitenschaden Fahrertür]',
    altVorher: '[PLATZHALTER: Alt-Text Vorher]',
    altNachher: '[PLATZHALTER: Alt-Text Nachher]',
  },
  {
    titel: '[PLATZHALTER: Fahrzeug und Schaden, z. B. Heckschaden nach Auffahrunfall]',
    altVorher: '[PLATZHALTER: Alt-Text Vorher]',
    altNachher: '[PLATZHALTER: Alt-Text Nachher]',
  },
];

export const fertigePaare = allePaare.filter((p) => p.vorher && p.nachher);
export const hatVorherNachher = fertigePaare.length > 0;
