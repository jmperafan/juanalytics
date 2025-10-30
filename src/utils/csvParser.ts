// Simple CSV parser utility for reading content from CSV files

export interface ContentItem {
  type: 'video' | 'podcast' | 'talk' | 'book';
  url: string;
  title: string;
  date: Date;
  duration?: string;
  description: string;
  thumbnail?: string;
  tags: string[];
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
 * Parse CSV content into structured data
 */
export function parseCSV(csvContent: string): ContentItem[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const items: ContentItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;

    const item: any = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';

      if (header === 'date') {
        item[header] = value ? new Date(value) : new Date();
      } else if (header === 'tags') {
        item[header] = value ? value.split(';').map(t => t.trim()).filter(t => t) : [];
      } else {
        item[header] = value || undefined;
      }
    });

    if (item.type && item.url && item.title) {
      items.push(item as ContentItem);
    }
  }

  return items;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Group content items by type
 */
export function groupContentByType(items: ContentItem[]): ParsedContent {
  return {
    videos: items.filter(item => item.type === 'video').sort((a, b) => b.date.getTime() - a.date.getTime()),
    podcasts: items.filter(item => item.type === 'podcast').sort((a, b) => b.date.getTime() - a.date.getTime()),
    talks: items.filter(item => item.type === 'talk').sort((a, b) => b.date.getTime() - a.date.getTime()),
    books: items.filter(item => item.type === 'book').sort((a, b) => b.date.getTime() - a.date.getTime()),
  };
}

/**
 * Read CSV file from file system
 */
export async function readContentCSV(filePath: string = './content.csv'): Promise<ParsedContent> {
  try {
    const fs = await import('fs');
    const path = await import('path');

    const csvPath = path.resolve(filePath);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const items = parseCSV(csvContent);

    return groupContentByType(items);
  } catch (error) {
    console.error('Error reading content CSV:', error);
    return { videos: [], podcasts: [], talks: [], books: [] };
  }
}
