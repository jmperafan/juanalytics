import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { parse } from 'yaml';

/**
 * Load a YAML file shaped as `<key>: [items...]`, assigning each item a
 * stable id derived from its title so the file loader can track entries.
 */
function yamlList(path: string, key: string) {
  return file(path, {
    parser: (text) => {
      const items = parse(text)?.[key];
      if (!Array.isArray(items)) {
        throw new Error(`Expected "${key}" to be a list in ${path}`);
      }
      const seen = new Map<string, number>();
      return items.map((item: Record<string, unknown>) => {
        const slug = String(item.title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const count = (seen.get(slug) ?? 0) + 1;
        seen.set(slug, count);
        return { id: count > 1 ? `${slug}-${count}` : slug, ...item };
      });
    },
  });
}

const mediaSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  date: z.coerce.date(),
  description: z.string(),
  duration: z.string().optional(),
  thumbnail: z.string().optional(),
  thumbnail_fit: z.enum(['cover', 'contain']).optional(),
  tags: z.array(z.string()).default([]),
});

const podcastSchema = mediaSchema.extend({
  // A few older guest appearances don't name the show
  podcast: z.string().optional(),
  episode: z.coerce.number().optional(),
});

const blogs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/blogs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const videos = defineCollection({
  loader: yamlList('content/videos.yml', 'videos'),
  schema: mediaSchema.extend({
    platform: z.enum(['youtube', 'vimeo', 'other']).default('youtube'),
  }),
});

const talks = defineCollection({
  loader: yamlList('content/talks.yml', 'talks'),
  schema: mediaSchema.extend({
    // Some talks have no public recording or event page
    url: z.string().url().optional(),
    event: z.string(),
    location: z.string().optional(),
  }),
});

const books = defineCollection({
  loader: yamlList('content/books.yml', 'books'),
  schema: mediaSchema.extend({
    publisher: z.string().optional(),
    buttonText: z.string().default('View Book'),
  }),
});

// Podcasts are split by source so pages can address each show directly.
const guestAppearances = defineCollection({
  loader: yamlList('content/guest_appearances.yml', 'guest_appearances'),
  schema: podcastSchema,
});

const sqlLinguaFranca = defineCollection({
  loader: yamlList('content/sql_lingua_franca.yml', 'sql_lingua_franca'),
  schema: podcastSchema,
});

const dataHustle = defineCollection({
  loader: yamlList('content/data_hustle_podcast.yml', 'data_hustle_podcast'),
  schema: podcastSchema,
});

const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM');

const experience = defineCollection({
  loader: file('content/experience.yml', {
    parser: (text) => {
      const items = parse(text)?.experience;
      if (!Array.isArray(items)) {
        throw new Error('Expected "experience" to be a list in content/experience.yml');
      }
      // Preserve file order: pages rely on it for display.
      return items.map((item: Record<string, unknown>, index: number) => ({
        id: `${String(index).padStart(2, '0')}-${String(item.org).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        order: index,
        ...item,
      }));
    },
  }),
  schema: z.object({
    role: z.string(),
    org: z.string(),
    group: z.string().optional(),
    start: yearMonth,
    end: yearMonth.nullable(),
    description: z.string(),
    order: z.number(),
  }),
});

export const collections = {
  experience,
  blogs,
  videos,
  talks,
  books,
  guestAppearances,
  sqlLinguaFranca,
  dataHustle,
};
