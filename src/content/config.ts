import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    videoUrl: z.string().optional(),
    thumbnail: z.string().optional(),
    platform: z.enum(['youtube', 'vimeo', 'other']).default('youtube'),
    tags: z.array(z.string()).optional(),
  }),
});

const podcasts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    podcastName: z.string().optional(),
    audioUrl: z.string().optional(),
    duration: z.string().optional(),
    episode: z.number().optional(),
    thumbnail: z.string().optional(),
    type: z.enum(['own', 'guest']).default('guest'),
    tags: z.array(z.string()).optional(),
  }),
});

const books = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    coverImage: z.string().optional(),
    amazonUrl: z.string().optional(),
    publisher: z.string().optional(),
    coAuthors: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const talks = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    event: z.string(),
    eventUrl: z.string().optional(),
    date: z.coerce.date(),
    location: z.string().optional(),
    videoUrl: z.string().optional(),
    slidesUrl: z.string().optional(),
    thumbnail: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, videos, podcasts, books, talks };
