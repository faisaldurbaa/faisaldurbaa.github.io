// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import rss from "@astrojs/rss";

// https://astro.build/config
export default defineConfig({
  site: 'https://myagnetgit.github.io/', 
  integrations: [
    tailwind(), 
    sitemap(),
    rss({
      title: 'Joe Snow | Blog',
      description: 'A collection of articles on technology, data, and design.',
      dest: '/rss.xml',
      customData: `<language>en-us</language>`,
    })
  ],
});