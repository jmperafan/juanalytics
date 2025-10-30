import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://jmperafan.github.io',
  base: '/juanalytics/',
  integrations: [mdx(), sitemap()],
});
