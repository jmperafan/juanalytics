import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blogs');

  return rss({
    title: 'Juanalytics Blog',
    description: 'Articles on analytics engineering, dbt, data modeling, and the modern data stack by Juan Manuel Perafan',
    site: context.site || 'https://juanalytics.com',
    items: blog.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags || [],
      author: 'Juan Manuel Perafan',
    })),
    customData: `<language>en-us</language>`,
    stylesheet: '/rss-styles.xsl',
  });
}
