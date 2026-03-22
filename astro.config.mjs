import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: 'https://service.atlas24.ch',
  integrations: [
    tailwind(),
    sitemap({
      // alles, was hier false zurückgibt, kommt NICHT in die Sitemap
      filter: (page) => ![
        '/validate_phone_number/',
        '/embed/',
        '/embed_validate/',
        // optional:
        // '/form_flow/',
        // '/api/', '/preview/'
      ].includes(page)
    }),
  ],
  output: 'static',
  // optional: erzwinge Slash-Konsistenz (deine Sitemap nutzt / am Ende)
  trailingSlash: 'always',
});
