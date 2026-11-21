import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL || undefined;

export default defineConfig({
  output: 'static',
  site,
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
