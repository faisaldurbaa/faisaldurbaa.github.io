import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  site: 'https://faisaldurbaa.com',
  // The playbooks moved from /blog/ into the Open Horizon course.
  redirects: Object.fromEntries(
    ['the-mark-cuban-playbook', 'the-silverman-journey', 'the-google-cloud-playbook', 'the-ted-sarandos-playbook']
      .map((s) => [`/blog/${s}/`, `/courses/open-horizon/${s}/`]),
  ),
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
    // Redirect stubs and noindex pages stay out of the sitemap.
    sitemap({ filter: (page) => !/\/(about|portfolio|404|red\/.*|en\/red\/.*)\/?$/.test(new URL(page).pathname) }),
    icon(),
  ],
});
