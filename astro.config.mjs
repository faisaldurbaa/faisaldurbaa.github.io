import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import rss from "@astrojs/rss";

export default defineConfig({
  site: 'https://myagnetgit.github.io/', 
  integrations: [
    tailwind(), 
    sitemap(),
  ],
});