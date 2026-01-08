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
 * Read multiple YAML files from the content directory
 * @throws Error if YAML files cannot be read or parsed
 */
export async function readContentYAML(): Promise<ParsedContent> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const yaml = await import('yaml');

    const contentDir = path.resolve(process.cwd(), './content');

    // Helper function to read and parse a YAML file
    const readYAMLFile = (filename: string): RawContentItem[] => {
      const filePath = path.join(contentDir, filename);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  YAML file not found: ${filePath}`);
        return [];
      }
      const yamlContent = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.parse(yamlContent);

      // Handle files with top-level keys (like videos: [...])
      if (data && typeof data === 'object') {
        // Get the first key's value if it's an array
        const firstKey = Object.keys(data)[0];
        if (firstKey && Array.isArray(data[firstKey])) {
          return data[firstKey];
        }
      }

      // If it's already an array, return it
      if (Array.isArray(data)) {
        return data;
      }

      return [];
    };

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

    // Read each content file
    const videos = readYAMLFile('videos.yml');
    const sqlLinguaFranca = readYAMLFile('sql_lingua_franca.yml');
    const guestAppearances = readYAMLFile('guest_appearances.yml');
    const talks = readYAMLFile('talks.yml');
    const books = readYAMLFile('books.yml');

    // Merge podcasts (SQL Lingua Franca + guest appearances)
    const allPodcasts = [...sqlLinguaFranca, ...guestAppearances];

    return {
      videos: processItems(videos),
      podcasts: processItems(allPodcasts),
      talks: processItems(talks),
      books: processItems(books),
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
