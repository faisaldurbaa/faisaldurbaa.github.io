import typography from '@tailwindcss/typography';

// Blue-tinted neutrals: content written against slate/gray keeps working in the sheet palette.
const sheetScale = {
  50: '#F4F7FC', 100: '#EEF4FF', 200: '#DCE6F7', 300: '#C3D2F2', 400: '#9DB3E3',
  500: '#4466B2', 600: '#3B5FB4', 700: '#1F49A8', 800: '#0D3389', 900: '#0A2A78', 950: '#071F5C',
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        slate: sheetScale,
        gray: sheetScale,
        accent: 'rgb(var(--ink-rgb) / <alpha-value>)',
        ground: 'var(--ground)',
        ink: 'var(--ink)',
        body: 'var(--text)',
        muted: 'var(--muted)',
        rule: 'var(--rule)',
        stamp: 'var(--stamp)',
        mark: 'var(--mark)',
        panel: 'var(--panel)',
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        label: ['"Barlow Semi Condensed"', 'Barlow', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [typography],
};
