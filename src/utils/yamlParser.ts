// YAML parser utility for reading content from YAML files

export interface ContentItem {
  type: 'video' | 'podcast' | 'talk' | 'book';
  url: string;
  title: string;
  date: Date;
  duration?: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  platform?: 'youtube' | 'vimeo' | 'other';
  podcast?: string;
  episode?: string;
  event?: string;
  location?: string;
  publisher?: string;
  extra1?: string;
  extra2?: string;
}

export interface ParsedContent {
  videos: ContentItem[];
  podcasts: ContentItem[];
  talks: ContentItem[];
  books: ContentItem[];
}

/**
 * Read YAML file from file system
 */
export async function readContentYAML(filePath: string = './content.yml'): Promise<ParsedContent> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const yaml = await import('yaml');

    // Resolve path from project root
    // In Astro builds, process.cwd() points to the project root
    const yamlPath = path.resolve(process.cwd(), filePath);
    const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
    const data = yaml.parse(yamlContent);

    // Process and sort each content type
    const processItems = (items: any[]): ContentItem[] => {
      return items
        .map((item: any) => ({
          ...item,
          date: item.date ? new Date(item.date) : new Date(),
          tags: Array.isArray(item.tags) ? item.tags : [],
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    };

    // Merge sql_lingua_franca and guest_appearances into podcasts for backward compatibility
    const sqlLinguaFranca = data.sql_lingua_franca || [];
    const guestAppearances = data.guest_appearances || [];
    const allPodcasts = [...sqlLinguaFranca, ...guestAppearances];

    return {
      videos: processItems(data.videos || []),
      podcasts: processItems(allPodcasts),
      talks: processItems(data.talks || []),
      books: processItems(data.books || []),
    };
  } catch (error) {
    console.error('Error reading content YAML:', error);
    return { videos: [], podcasts: [], talks: [], books: [] };
  }
}
