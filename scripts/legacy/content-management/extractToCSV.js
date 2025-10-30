#!/usr/bin/env node

/**
 * Extract existing content from markdown files to CSV
 * This script reads all markdown files in src/content and extracts their frontmatter to CSV format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '../..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'src/content');
const OUTPUT_CSV = path.join(PROJECT_ROOT, 'content.csv');

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Remove quotes
    if ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }

    // Handle arrays
    if (value === '[]') {
      frontmatter[key] = [];
    } else if (value.startsWith('[') && !value.endsWith(']')) {
      // Multi-line array - skip for now
      frontmatter[key] = [];
    } else {
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

function processDirectory(dir, type) {
  const files = fs.readdirSync(dir);
  const items = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter) continue;

    const item = {
      type,
      url: frontmatter.videoUrl || frontmatter.audioUrl || frontmatter.eventUrl || frontmatter.amazonUrl || '',
      title: frontmatter.title || '',
      date: frontmatter.pubDate || frontmatter.date || '',
      duration: frontmatter.duration || '',
      description: frontmatter.description || '',
      thumbnail: frontmatter.thumbnail || frontmatter.coverImage || '',
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.join(';') : '',
      extra1: '',
      extra2: '',
    };

    // Type-specific fields
    if (type === 'video') {
      item.extra1 = frontmatter.platform || 'youtube';
    } else if (type === 'podcast') {
      item.extra1 = frontmatter.episode || '';
      item.extra2 = frontmatter.podcastName || '';
    } else if (type === 'talk') {
      item.extra1 = frontmatter.event || '';
      item.extra2 = frontmatter.location || '';
    } else if (type === 'book') {
      item.extra1 = frontmatter.publisher || '';
      item.extra2 = Array.isArray(frontmatter.coAuthors) ? frontmatter.coAuthors.join(';') : '';
    }

    items.push(item);
  }

  return items;
}

function escapeCSV(value) {
  if (!value) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function main() {
  console.log('Extracting content from markdown files...\n');

  const allItems = [];

  // Process each content type
  const types = ['videos', 'podcasts', 'talks', 'books'];

  for (const type of types) {
    const dir = path.join(CONTENT_DIR, type);
    if (!fs.existsSync(dir)) {
      console.log(`Skipping ${type} (directory not found)`);
      continue;
    }

    const items = processDirectory(dir, type.slice(0, -1)); // Remove 's' from type name
    allItems.push(...items);
    console.log(`✓ Found ${items.length} ${type}`);
  }

  // Write to CSV
  const headers = ['type', 'url', 'title', 'date', 'duration', 'description', 'thumbnail', 'tags', 'extra1', 'extra2'];
  const lines = [headers.join(',')];

  for (const item of allItems) {
    const row = headers.map(header => escapeCSV(item[header]));
    lines.push(row.join(','));
  }

  fs.writeFileSync(OUTPUT_CSV, lines.join('\n'), 'utf-8');

  console.log(`\n✓ Exported ${allItems.length} items to ${OUTPUT_CSV}`);
  console.log('\nNext steps:');
  console.log('1. Review content.csv and fill in missing URLs');
  console.log('2. Run: node scripts/content-management/enrichCSV.js');
  console.log('3. Test with: npm run dev');
}

main();
