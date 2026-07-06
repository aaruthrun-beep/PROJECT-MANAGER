// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://anomalyco.github.io',
  base,

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});
