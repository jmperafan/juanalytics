#!/usr/bin/env node
/**
 * Checks the Data Hustle Podcast YouTube playlist for episodes that aren't
 * yet in content/data_hustle_podcast.yml and appends draft entries for them.
 *
 * Uses the playlist's public Atom feed (no API key required), so it only
 * sees the ~15 most recently added videos. Title/description are raw
 * YouTube copy and duration is a best-effort scrape of the watch page.
 *
 * The playlist is collaborative, so anything can end up in the feed (e.g.
 * spam bots adding unrelated videos) — entries whose title doesn't contain
 * "Data Hustle" are skipped rather than filed as an episode.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const PLAYLIST_ID = 'PL6PtmCevAVx_jRJ3HpBabEhwCiE0oD6ps';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;
const YAML_PATH = fileURLToPath(new URL('../content/data_hustle_podcast.yml', import.meta.url));
const YAML_KEY = 'data_hustle_podcast';
const PODCAST_NAME = 'The Data Hustle Podcast';

function decodeXmlEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

// Strips YouTube chapter-marker lines ("00:00 Intro") and a trailing
// "## Chapters" heading, which clutter the raw video description.
function cleanDescription(text) {
  return text
    .split('\n')
    .filter((line) => !/^\d{1,2}:\d{2}(:\d{2})?\s+\S/.test(line.trim()) && line.trim() !== '## Chapters')
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseFeedEntries(xml) {
  const entries = [];
  for (const block of xml.split('<entry>').slice(1)) {
    const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = block.match(/<title>([^<]*)<\/title>/)?.[1];
    const published = block.match(/<published>([^<]+)<\/published>/)?.[1];
    const description = block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? '';
    if (!videoId || !title || !published) continue;
    entries.push({
      videoId,
      title: decodeXmlEntities(title),
      published,
      description: decodeXmlEntities(description),
    });
  }
  return entries;
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

async function fetchDuration(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    if (!res.ok) return undefined;
    const html = await res.text();
    const seconds = html.match(/"lengthSeconds":"(\d+)"/)?.[1];
    return seconds ? formatDuration(Number(seconds)) : undefined;
  } catch {
    return undefined;
  }
}

function extractVideoId(url) {
  return url.match(/[?&]v=([\w-]+)/)?.[1];
}

async function main() {
  const rawText = readFileSync(YAML_PATH, 'utf-8');
  const existingFile = parse(rawText);
  const existingEpisodes = existingFile?.[YAML_KEY];
  if (!Array.isArray(existingEpisodes)) {
    throw new Error(`Expected "${YAML_KEY}" to be a list in ${YAML_PATH}`);
  }

  const existingVideoIds = new Set(existingEpisodes.map((e) => extractVideoId(e.url)).filter(Boolean));
  const maxEpisode = Math.max(0, ...existingEpisodes.map((e) => Number(e.episode) || 0));

  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Failed to fetch playlist feed: HTTP ${res.status}`);
  const feedEntries = parseFeedEntries(await res.text());

  const newEntries = feedEntries
    .filter((e) => !existingVideoIds.has(e.videoId))
    .filter((e) => {
      const isEpisode = /data hustle/i.test(e.title);
      if (!isEpisode) console.log(`Skipping non-episode playlist entry: ${e.title}`);
      return isEpisode;
    })
    .sort((a, b) => new Date(a.published) - new Date(b.published));

  if (newEntries.length === 0) {
    console.log('No new episodes found.');
    return;
  }

  const draftEpisodes = [];
  let nextEpisode = maxEpisode + 1;
  for (const entry of newEntries) {
    const duration = await fetchDuration(entry.videoId);
    draftEpisodes.push({
      url: `https://www.youtube.com/watch?v=${entry.videoId}`,
      title: entry.title,
      date: entry.published.slice(0, 10),
      podcast: PODCAST_NAME,
      episode: String(nextEpisode),
      description: cleanDescription(entry.description),
      ...(duration ? { duration } : {}),
      thumbnail: `https://i.ytimg.com/vi/${entry.videoId}/maxresdefault.jpg`,
      tags: [],
    });
    nextEpisode += 1;
    console.log(`Draft added: episode ${draftEpisodes.at(-1).episode} - ${entry.title}`);
  }

  // Insert only the new entries as raw YAML text, right after the list header,
  // so existing entries are left byte-for-byte untouched (no reformatting churn).
  const headerMatch = rawText.match(/^data_hustle_podcast:[ \t]*\n/m);
  if (!headerMatch) {
    throw new Error(`Could not find "${YAML_KEY}:" header in ${YAML_PATH}`);
  }
  const insertAt = headerMatch.index + headerMatch[0].length;
  const newBlock = stringify(draftEpisodes.reverse(), { lineWidth: 0 });
  writeFileSync(YAML_PATH, rawText.slice(0, insertAt) + newBlock + rawText.slice(insertAt));

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const lines = draftEpisodes
      .map((e) => `- Episode ${e.episode}: [${e.title}](${e.url})`)
      .join('\n');
    writeFileSync(summaryPath, `## New Data Hustle Podcast episodes\n${lines}\n`, { flag: 'a' });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
