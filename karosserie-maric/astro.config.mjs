// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://karosserie-maric.de',
  trailingSlash: 'always',
  build: {
    // Alle Styles und Skripte als eigene Dateien ausliefern, damit die
    // Content-Security-Policy ohne 'unsafe-inline' auskommt.
    inlineStylesheets: 'never',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
