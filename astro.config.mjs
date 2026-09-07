import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// Custom domain: juanalytics.com
export default defineConfig({
  site: 'https://juanalytics.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    // Wrap long lines instead of adding a horizontal scrollbar. Shell
    // commands with long `--args '{...}'` blobs (and the embedded SKILL.md
    // frontmatter) overflow badly otherwise.
    shikiConfig: { wrap: true },
  },
});
