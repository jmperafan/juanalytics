import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://jmperafan.github.io',
  // Remove base for local development, add it back when deploying to GitHub Pages
  // base: '/Juanalytics',
  integrations: [mdx(), sitemap()],
});
