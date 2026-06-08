import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  site: 'https://faisaldurbaa.com',
  vite: {
    optimizeDeps: {
      include: [
        'astro/runtime/client/dev-toolbar/entrypoint.js',
        'chart.js/auto',
        'chartjs-plugin-annotation',
      ],
    },
  },
  markdown: {
    rehypePlugins: [[rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]],
  },
  integrations: [
    mdx(), 
    tailwind(), 
    sitemap(),
    icon(),
  ],
});
