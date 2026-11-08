/** Vorher/Nachher-Regler. Ohne JavaScript bleiben beide Bilder nebeneinander sichtbar. */
export function initVorherNachher(): void {
  document.querySelectorAll<HTMLElement>('[data-vn]').forEach((fig) => {
    const buehne = fig.querySelector<HTMLElement>('.vn__buehne');
    const regler = fig.querySelector<HTMLInputElement>('.vn__regler');
    if (!buehne || !regler) return;

    const setze = (wert: number) => {
      const pos = Math.min(100, Math.max(0, wert));
      regler.value = String(Math.round(pos));
      regler.setAttribute('aria-valuetext', `${Math.round(pos)} Prozent Vorher`);
      fig.style.setProperty('--pos', `${pos}%`);
    };

    regler.hidden = false;
    fig.classList.add('is-aktiv');
    setze(Number(regler.value));

    regler.addEventListener('input', () => setze(Number(regler.value)));

    let ziehen = false;
    const ausZeiger = (e: PointerEvent) => {
      const r = buehne.getBoundingClientRect();
      setze(((e.clientX - r.left) / r.width) * 100);
    };
    buehne.addEventListener('pointerdown', (e) => {
      ziehen = true;
      buehne.setPointerCapture(e.pointerId);
      ausZeiger(e);
    });
    buehne.addEventListener('pointermove', (e) => { if (ziehen) ausZeiger(e); });
    const ende = () => { ziehen = false; };
    buehne.addEventListener('pointerup', ende);
    buehne.addEventListener('pointercancel', ende);
  });
}
