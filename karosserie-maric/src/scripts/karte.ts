/**
 * Zwei-Klick-Karte: OpenStreetMap lädt erst nach ausdrücklichem Klick.
 * Vorher wird keine Verbindung zu einem fremden Server aufgebaut.
 */
export function initKarte(): void {
  document.querySelectorAll<HTMLElement>('[data-karte]').forEach((box) => {
    const btn = box.querySelector<HTMLButtonElement>('[data-karte-laden]');
    const src = box.dataset.src;
    if (!btn || !src) return;
    btn.hidden = false;
    btn.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = src;
      frame.title = box.dataset.titel ?? 'Karte';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer';
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
      frame.className = 'karte__frame';
      box.querySelector('.karte__vorschau')?.replaceWith(frame);
      frame.focus();
    }, { once: true });
  });
}
