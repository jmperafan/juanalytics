#!/usr/bin/env node

/**
 * YouTube Channel Scraper Script
 *
 * This script fetches all videos from a YouTube channel and adds them to content.csv
 * It filters out YouTube Shorts and includes metadata like title, date, description, etc.
 *
 * Requirements:
 * - YouTube Data API v3 key (https://console.cloud.google.com/apis/credentials)
 * - Set YOUTUBE_API_KEY environment variable
 *
 * Usage:
 * YOUTUBE_API_KEY=your_api_key node scripts/content-management/scrapeYouTubeChannel.js
 *
 * Or with a .env file:
 * node scripts/content-management/scrapeYouTubeChannel.js
 */

import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const CSV_FILE = './content.csv';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_HANDLE = '@juanmanuelperafan'; // Your channel handle

/**
 * Fetch JSON from URL
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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
 * Get channel ID from channel handle
 */
async function getChannelId(handle) {
  const cleanHandle = handle.replace('@', '');
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${cleanHandle}&key=${YOUTUBE_API_KEY}`;

  try {
    const data = await fetchJSON(url);
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.channelId;
    }
    throw new Error('Channel not found');
  } catch (error) {
    throw new Error(`Failed to get channel ID: ${error.message}`);
  }
}

/**
 * Get all videos from a channel
 */
async function getChannelVideos(channelId) {
  let videos = [];
  let nextPageToken = null;

  console.log('Fetching videos from channel...\n');

  do {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=50&type=video${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;

    try {
      const data = await fetchJSON(url);

      if (data.items) {
        videos = videos.concat(data.items);
        console.log(`Fetched ${videos.length} videos so far...`);
      }

      nextPageToken = data.nextPageToken;

      // Add delay to avoid rate limiting
      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error fetching videos: ${error.message}`);
      break;
    }
  } while (nextPageToken);

  return videos;
}

/**
 * Get detailed video information
 */
async function getVideoDetails(videoIds) {
  const chunks = [];
  const chunkSize = 50; // YouTube API allows max 50 IDs per request

  // Split video IDs into chunks of 50
  for (let i = 0; i < videoIds.length; i += chunkSize) {
    chunks.push(videoIds.slice(i, i + chunkSize));
  }

  let allDetails = [];

  for (const chunk of chunks) {
    const ids = chunk.join(',');
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${ids}&part=snippet,contentDetails,statistics`;

    try {
      const data = await fetchJSON(url);
      if (data.items) {
        allDetails = allDetails.concat(data.items);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching video details: ${error.message}`);
    }
  }

  return allDetails;
}

/**
 * Convert ISO 8601 duration to readable format (e.g., PT1H2M10S -> 01:02:10)
 */
function parseDuration(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';

  const hours = match[1] || 0;
  const minutes = match[2] || 0;
  const seconds = match[3] || 0;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

/**
 * Check if a video is a YouTube Short
 * Shorts are typically under 60 seconds
 */
function isShort(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return false;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Consider videos under 60 seconds as Shorts
  return totalSeconds <= 60;
}

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
      row[header] = (values[index] && values[index].trim()) || '';
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
 * Truncate description to a reasonable length
 */
function truncateDescription(description, maxLength = 150) {
  if (!description || description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
}

/**
 * Main function
 */
async function main() {
  console.log('YouTube Channel Scraper\n');
  console.log('========================\n');

  // Check for API key
  if (!YOUTUBE_API_KEY) {
    console.error('Error: YOUTUBE_API_KEY environment variable not set');
    console.log('\nPlease set your YouTube Data API v3 key:');
    console.log('  export YOUTUBE_API_KEY=your_api_key');
    console.log('\nOr create a .env file in the project root with:');
    console.log('  YOUTUBE_API_KEY=your_api_key');
    console.log('\nGet an API key at: https://console.cloud.google.com/apis/credentials');
    process.exit(1);
  }

  // Check if CSV file exists
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`Error: ${CSV_FILE} not found`);
    process.exit(1);
  }

  try {
    // Get channel ID
    console.log(`Getting channel ID for ${CHANNEL_HANDLE}...`);
    const channelId = await getChannelId(CHANNEL_HANDLE);
    console.log(`✓ Channel ID: ${channelId}\n`);

    // Get all videos
    const videos = await getChannelVideos(channelId);
    console.log(`\n✓ Found ${videos.length} total videos\n`);

    // Get detailed information for all videos
    console.log('Fetching detailed video information...\n');
    const videoIds = videos.map(v => v.id.videoId);
    const videoDetails = await getVideoDetails(videoIds);

    // Filter out Shorts
    const regularVideos = videoDetails.filter(video => {
      const duration = video.contentDetails.duration;
      return !isShort(duration);
    });

    console.log(`✓ Filtered to ${regularVideos.length} regular videos (excluded ${videoDetails.length - regularVideos.length} Shorts)\n`);

    // Read existing CSV
    const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
    const { headers, rows } = parseCSV(csvContent);

    // Get existing video URLs to avoid duplicates
    const existingUrls = new Set(rows.map(row => row.url));

    // Convert YouTube videos to CSV rows
    let addedCount = 0;
    const newRows = [];

    for (const video of regularVideos) {
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

      // Skip if already exists
      if (existingUrls.has(videoUrl)) {
        console.log(`⊘ Skipping ${video.snippet.title} (already exists)`);
        continue;
      }

      const publishedDate = video.snippet.publishedAt.split('T')[0];
      const duration = parseDuration(video.contentDetails.duration);
      const description = truncateDescription(video.snippet.description);
      const thumbnail = (video.snippet.thumbnails.maxres && video.snippet.thumbnails.maxres.url) ||
                       (video.snippet.thumbnails.high && video.snippet.thumbnails.high.url) ||
                       (video.snippet.thumbnails.medium && video.snippet.thumbnails.medium.url) || '';

      newRows.push({
        type: 'video',
        url: videoUrl,
        title: video.snippet.title,
        date: publishedDate,
        duration: duration,
        description: description,
        thumbnail: thumbnail,
        tags: '',
        extra1: 'youtube',
        extra2: ''
      });

      addedCount++;
      console.log(`+ Added: ${video.snippet.title}`);
    }

    if (addedCount === 0) {
      console.log('\n✓ No new videos to add. All videos are already in the CSV.');
      return;
    }

    // Combine existing rows with new rows
    const allRows = [...rows, ...newRows];

    // Sort by date (newest first)
    allRows.sort((a, b) => {
      const dateA = a.date || '1970-01-01';
      const dateB = b.date || '1970-01-01';
      return dateB.localeCompare(dateA);
    });

    // Write back to CSV
    const newCSV = toCSV(headers, allRows);
    fs.writeFileSync(CSV_FILE, newCSV, 'utf-8');

    console.log(`\n✓ Added ${addedCount} new video(s) to ${CSV_FILE}`);
    console.log(`✓ Total videos in CSV: ${allRows.filter(r => r.type === 'video').length}`);
    console.log('\nNext steps:');
    console.log('1. Review the updated content.csv file');
    console.log('2. Adjust any descriptions or metadata as needed');
    console.log('3. Run npm run dev to see the changes');

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
