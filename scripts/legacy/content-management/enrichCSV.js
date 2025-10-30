#!/usr/bin/env node

/**
 * CSV Content Enrichment Script
 *
 * This script reads your content.csv file, extracts metadata from URLs,
 * and updates the CSV with additional information like titles, dates,
 * descriptions, thumbnails, and durations.
 *
 * Usage: node scripts/enrichCSV.js
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

const CSV_FILE = './content.csv';

/**
 * Parse CSV content
 */
function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line) {
  const values = [];
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
 * Convert rows back to CSV format
 */
function toCSV(headers, rows) {
  const escapeValue = (value) => {
    if (!value) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(',')];
  rows.forEach(row => {
    const values = headers.map(header => escapeValue(row[header] || ''));
    lines.push(values.join(','));
  });

  return lines.join('\n');
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
    /youtube\.com\/shorts\/([^&\s]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Fetch YouTube video metadata using oEmbed API
 */
async function fetchYouTubeMetadata(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  try {
    // Use YouTube oEmbed API (no API key required)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const data = await fetchJSON(oembedUrl);

    return {
      title: data.title || '',
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      description: data.title || '', // oEmbed doesn't provide description
      author: data.author_name || '',
    };
  } catch (error) {
    console.error(`Error fetching YouTube metadata for ${videoId}:`, error.message);
    return null;
  }
}

/**
 * Fetch JSON from URL
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Enrich a single content row with metadata
 */
async function enrichRow(row) {
  const { type, url, title, description, thumbnail } = row;

  // Skip if already has all required fields
  if (title && description && thumbnail) {
    console.log(`✓ Skipping ${url} (already complete)`);
    return row;
  }

  console.log(`⟳ Enriching ${url}...`);

  let metadata = null;

  // YouTube videos
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    metadata = await fetchYouTubeMetadata(url);
  }

  // Update row with fetched metadata
  if (metadata) {
    if (!title) row.title = metadata.title;
    if (!description) row.description = metadata.description || metadata.title;
    if (!thumbnail) row.thumbnail = metadata.thumbnail;

    console.log(`✓ Enriched ${url}`);
  } else {
    console.log(`✗ Could not enrich ${url}`);
  }

  return row;
}

/**
 * Main function
 */
async function main() {
  console.log('CSV Content Enrichment Script\n');

  // Check if CSV file exists
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`Error: ${CSV_FILE} not found`);
    console.log('\nPlease create a content.csv file with the following format:');
    console.log('type,url,title,date,duration,description,thumbnail,tags,extra1,extra2');
    process.exit(1);
  }

  // Read CSV file
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const { headers, rows } = parseCSV(csvContent);

  if (rows.length === 0) {
    console.log('No content rows found in CSV. Add some URLs to get started!');
    process.exit(0);
  }

  console.log(`Found ${rows.length} content item(s)\n`);

  // Enrich each row
  const enrichedRows = [];
  for (const row of rows) {
    const enriched = await enrichRow(row);
    enrichedRows.push(enriched);

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Write back to CSV
  const newCSV = toCSV(headers, enrichedRows);
  fs.writeFileSync(CSV_FILE, newCSV, 'utf-8');

  console.log(`\n✓ Updated ${CSV_FILE}`);
  console.log('\nNext steps:');
  console.log('1. Review the updated content.csv file');
  console.log('2. Fill in any missing information manually');
  console.log('3. Run your Astro dev server to see the changes');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
