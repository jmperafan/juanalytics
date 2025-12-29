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
  buttonText?: string;
  extra1?: string;
  extra2?: string;
}

export interface ParsedContent {
  videos: ContentItem[];
  podcasts: ContentItem[];
  talks: ContentItem[];
  books: ContentItem[];
}

interface RawContentItem {
  type?: string;
  url?: string;
  title?: string;
  date?: string | Date;
  duration?: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  platform?: string;
  podcast?: string;
  episode?: string;
  event?: string;
  location?: string;
  publisher?: string;
  buttonText?: string;
  extra1?: string;
  extra2?: string;
  [key: string]: unknown;
}

interface RawYAMLData {
  videos?: RawContentItem[];
  podcasts?: RawContentItem[];
  talks?: RawContentItem[];
  books?: RawContentItem[];
  sql_lingua_franca?: RawContentItem[];
  guest_appearances?: RawContentItem[];
  [key: string]: unknown;
}

/**
 * Read YAML file from file system
 * @throws Error if YAML file cannot be read or parsed
 */
export async function readContentYAML(filePath: string = './content.yml'): Promise<ParsedContent> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const yaml = await import('yaml');

    // Resolve path from project root
    // In Astro builds, process.cwd() points to the project root
    const yamlPath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(yamlPath)) {
      throw new Error(`YAML file not found at ${yamlPath}`);
    }

    const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
    const data = yaml.parse(yamlContent) as RawYAMLData;

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid YAML structure: expected an object');
    }

    // Process and sort each content type
    const processItems = (items: RawContentItem[]): ContentItem[] => {
      return items
        .map((item: RawContentItem) => ({
          ...item,
          date: item.date ? new Date(item.date) : new Date(),
          tags: Array.isArray(item.tags) ? item.tags : [],
        } as ContentItem))
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error reading content YAML:', errorMessage);

    // During build, we want to fail loudly so errors are caught
    if (import.meta.env.PROD) {
      throw new Error(`Failed to load content: ${errorMessage}`);
    }

    // In development, return empty arrays but warn
    console.warn('⚠️  Returning empty content arrays. Please fix the error above.');
    return { videos: [], podcasts: [], talks: [], books: [] };
  }
}
