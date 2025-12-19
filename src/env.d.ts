/// <reference types="astro/client" />
import ".astro/types.d.ts";
import type { ImageMetadata } from 'astro';

interface ImportMetaEnv {
  readonly PUBLIC_FORMSPREE_ID: string;
  readonly PUBLIC_RECAPTCHA_SITE_KEY: string;
  readonly PUBLIC_CLOUDFLARE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'chartjs-plugin-annotation';
declare module '*.webp' {
  const value: ImageMetadata;
  export default value;
}
