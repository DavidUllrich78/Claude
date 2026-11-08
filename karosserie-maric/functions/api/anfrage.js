/**
 * Cloudflare Pages Function: POST /api/anfrage
 *
 * Nimmt das Kontaktformular (multipart/form-data) entgegen, prüft alle
 * Eingaben serverseitig und schickt sie als E-Mail mit Fotos über die
 * Brevo-API (EU, Paris) an den Betrieb.
 *
 * Benötigte Umgebungsvariablen (Cloudflare Pages > Settings > Variables, als
 * "Secret" verschlüsselt):
 *   BREVO_API_KEY  API-Schlüssel von Brevo (Transaktions-E-Mail)
 *   MAIL_TO        Empfänger, z. B. kontakt@karosserie-maric.de
 *   MAIL_FROM      bei Brevo verifizierte Absenderadresse, z. B. formular@karosserie-maric.de
 *
 * Keine Speicherung: Die Daten bleiben nur für die Dauer der Anfrage im
 * Arbeitsspeicher und gehen direkt per E-Mail an den Betrieb.
 */

const MAX_DATEIEN = 4;
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_GESAMT = 15 * 1024 * 1024;
const MAX_REQUEST = MAX_GESAMT + 64 * 1024;
const TELEFON = /^[0-9+()/ \-]{6,30}$/;

/**
 * Dateityp anhand der ersten Bytes erkennen, nicht anhand der Angabe des Browsers.
 * Nur JPG und PNG: Diese Formate nimmt jeder Mail-Dienst als Anhang an.
 * iOS wandelt HEIC beim Hochladen automatisch in JPG um.
 */
function erkenneBild(b) {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg' };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: 'png' };
  return null;
}

function base64(bytes) {
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

/** Steuerzeichen entfernen, Zeilenumbrüche nur wo erlaubt. */
function sauber(wert, max, mehrzeilig = false) {
  if (typeof wert !== 'string') return '';
  const muster = mehrzeilig ? /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g;
  return wert.replace(/\r\n?/g, '\n').replace(muster, '').trim().slice(0, max);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const weiter = (request, pfad) => Response.redirect(new URL(pfad, request.url).toString(), 303);

export async function onRequestPost({ request, env }) {
  const fehler = () => weiter(request, '/anfrage-fehler/');

  // Nur Anfragen von der eigenen Seite annehmen.
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return new Response('Forbidden', { status: 403 });

  const laenge = Number(request.headers.get('Content-Length') || 0);
  if (laenge > MAX_REQUEST) return fehler();

  const typ = request.headers.get('Content-Type') || '';
  if (!typ.startsWith('multipart/form-data')) return fehler();

  let form;
  try {
    form = await request.formData();
  } catch {
    return fehler();
  }

  // Honeypot: Bots füllen das versteckte Feld aus. Still "erfolgreich" antworten.
  if (sauber(form.get('website'), 200)) return weiter(request, '/anfrage-gesendet/');

  const name = sauber(form.get('name'), 100);
  const telefon = sauber(form.get('telefon'), 30);
  const nachricht = sauber(form.get('nachricht'), 3000, true);

  if (!name || !TELEFON.test(telefon) || nachricht.length < 10) return fehler();

  const dateien = form.getAll('fotos').filter((f) => typeof f === 'object' && f !== null && f.size > 0);
  if (dateien.length > MAX_DATEIEN) return fehler();

  const anhaenge = [];
  let gesamt = 0;
  for (const [i, datei] of dateien.entries()) {
    if (datei.size > MAX_BYTES) return fehler();
    gesamt += datei.size;
    if (gesamt > MAX_GESAMT) return fehler();
    const bytes = new Uint8Array(await datei.arrayBuffer());
    const bild = erkenneBild(bytes);
    if (!bild) return fehler();
    // Eigener Dateiname: Originalnamen nie übernehmen.
    anhaenge.push({ name: `schaden-foto-${i + 1}.${bild.ext}`, content: base64(bytes) });
  }

  if (!env.BREVO_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) {
    console.error('anfrage: Umgebungsvariablen fehlen');
    return fehler();
  }

  const text =
    `Neue Anfrage über karosserie-maric.de\n\n` +
    `Name: ${name}\nTelefon: ${telefon}\n\nNachricht:\n${nachricht}\n\n` +
    `Fotos: ${anhaenge.length}`;
  const html =
    `<p><strong>Neue Anfrage über karosserie-maric.de</strong></p>` +
    `<p>Name: ${escapeHtml(name)}<br>Telefon: ${escapeHtml(telefon)}</p>` +
    `<p>Nachricht:<br>${escapeHtml(nachricht).replace(/\n/g, '<br>')}</p>` +
    `<p>Fotos im Anhang: ${anhaenge.length}</p>`;

  const nutzlast = {
    sender: { name: 'Website Karosserie Maric', email: env.MAIL_FROM },
    to: [{ email: env.MAIL_TO }],
    subject: `Schadenmeldung von ${name.replace(/[\n\r]/g, ' ')}`,
    textContent: text,
    htmlContent: html,
  };
  if (anhaenge.length) nutzlast.attachment = anhaenge;

  try {
    const antwort = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(nutzlast),
    });
    if (!antwort.ok) {
      console.error('anfrage: Versand fehlgeschlagen', antwort.status);
      return fehler();
    }
  } catch (e) {
    console.error('anfrage: Versand fehlgeschlagen', e && e.message);
    return fehler();
  }

  return weiter(request, '/anfrage-gesendet/');
}

export function onRequest() {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}
