/**
 * Fortschreitende Verbesserung des Kontaktformulars:
 * Fehlermeldungen direkt am Feld, Prüfung der Fotos vor dem Absenden.
 * Ohne JavaScript greift die Prüfung des Browsers und des Servers.
 */
const MAX_DATEIEN = 4;
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_GESAMT = 15 * 1024 * 1024;
const TYPEN = ['image/jpeg', 'image/png'];

export function initFormular(): void {
  const form = document.querySelector<HTMLFormElement>('[data-formular]');
  if (!form) return;
  form.noValidate = true;

  const meldung = (feld: HTMLInputElement | HTMLTextAreaElement, text: string) => {
    const el = document.getElementById(`${feld.id}-fehler`);
    if (!el) return;
    el.textContent = text;
    el.hidden = !text;
    feld.setAttribute('aria-invalid', text ? 'true' : 'false');
  };

  const pruefeFeld = (feld: HTMLInputElement | HTMLTextAreaElement): boolean => {
    let text = '';
    if (feld.type === 'file') {
      const dateien = Array.from((feld as HTMLInputElement).files ?? []);
      const gesamt = dateien.reduce((s, d) => s + d.size, 0);
      if (dateien.length > MAX_DATEIEN) text = `Bitte höchstens ${MAX_DATEIEN} Fotos auswählen.`;
      else if (dateien.some((d) => d.type && !TYPEN.includes(d.type))) text = 'Bitte nur Fotos im Format JPG oder PNG.';
      else if (dateien.some((d) => d.size > MAX_BYTES)) text = 'Ein Foto ist größer als 8 MB. Bitte verkleinern oder ein anderes wählen.';
      else if (gesamt > MAX_GESAMT) text = 'Alle Fotos zusammen dürfen höchstens 15 MB groß sein.';
    } else if (feld.validity.valueMissing) {
      text = feld.dataset.leer ?? 'Bitte ausfüllen.';
    } else if (feld.validity.patternMismatch || feld.validity.tooShort) {
      text = feld.dataset.falsch ?? 'Bitte prüfen Sie die Eingabe.';
    } else if (feld.validity.tooLong) {
      text = 'Der Text ist zu lang.';
    }
    meldung(feld, text);
    return !text;
  };

  const felder = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-pruefen]'));
  felder.forEach((f) => {
    f.addEventListener(f.type === 'file' ? 'change' : 'blur', () => pruefeFeld(f));
    if (f.type !== 'file') f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') pruefeFeld(f); });
  });

  const dateiFeld = form.querySelector<HTMLInputElement>('input[type="file"]');
  const liste = form.querySelector<HTMLElement>('[data-dateiliste]');
  dateiFeld?.addEventListener('change', () => {
    if (!liste) return;
    const namen = Array.from(dateiFeld.files ?? []).map((d) => `${d.name} (${(d.size / 1024 / 1024).toFixed(1).replace('.', ',')} MB)`);
    liste.textContent = namen.length ? `Ausgewählt: ${namen.join(', ')}` : '';
  });

  // Nach "Zurück" im Browser (bfcache) den Button wieder freigeben.
  window.addEventListener('pageshow', () => {
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn && btn.dataset.text) {
      btn.disabled = false;
      btn.textContent = btn.dataset.text;
    }
  });

  form.addEventListener('submit', (e) => {
    const ergebnisse = felder.map(pruefeFeld);
    if (ergebnisse.includes(false)) {
      e.preventDefault();
      felder[ergebnisse.indexOf(false)]?.focus();
      return;
    }
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn) {
      btn.dataset.text = btn.textContent ?? '';
      btn.disabled = true;
      btn.textContent = 'Wird gesendet …';
    }
  });
}
