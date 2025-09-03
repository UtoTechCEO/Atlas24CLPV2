import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap"; // <– hinzufügen

// https://astro.build/config
export default defineConfig({
  site: 'https://service.atlas24.ch', // <– GANZ wichtig für korrekte Sitemap
  integrations: [
    tailwind(),
    sitemap(), // <– Sitemap aktivieren
  ],
  output: 'static', // wichtig für Vercel
});
