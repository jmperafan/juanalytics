# Content Management Workflow

This document describes the complete workflow for managing content (videos, podcasts, talks, books) on the Juanalytics website.

## Overview

The content management system uses a CSV-based approach where:

1. You manually add **type** and **url** columns to `content.csv`
2. Python scripts automatically enrich the CSV with metadata
3. Python scripts generate markdown files for the Astro website
4. The website automatically displays the content

## Prerequisites

### 1. Install Python Dependencies

```bash
pip install -r scripts/requirements.txt
```

### 2. Set Up YouTube API Key (Optional but Recommended)

For YouTube videos and podcasts, you'll get much better metadata with an API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project (or select existing)
3. Enable "YouTube Data API v3"
4. Create an API key
5. Copy `.env.example` to `.env`
6. Add your API key: `YOUTUBE_API_KEY=your_api_key_here`

**Note:** The YouTube API is free with 10,000 quota units/day (enough for ~100+ videos).

## The Workflow

### Step 1: Add URLs to content.csv

Edit `content.csv` and add new rows with just the first two columns:

```csv
type,url,modify,title,date,duration,description,thumbnail,tags,extra1,extra2
video,https://www.youtube.com/watch?v=YOUR_VIDEO_ID,,,,,,,,,
podcast,https://www.youtube.com/watch?v=ANOTHER_ID,,,,,,,,,
talk,https://www.meetup.com/event/12345,,,,,,,,,
book,https://www.amazon.com/dp/BOOK_ID,,,,,,,,,
```

**Supported Types:**
- `video` - YouTube videos, conference talks, etc.
- `podcast` - Podcast episodes (YouTube or other platforms)
- `talk` - Speaking engagements, meetups, conferences
- `book` - Published books

**Important:** Only add the `type` and `url` columns. Leave everything else empty!

**About the `modify` column:**

The `modify` column gives you fine-grained control over enrichment:

- **Leave empty** (default) - Script enriches only if fields are missing (smart behavior)
- **Set to FALSE** - Locks the row - script will NEVER modify it (protects your customizations)
- **Set to TRUE** - Forces refresh - script will overwrite ALL fields with fresh metadata

**Use cases:**
- Custom titles/descriptions: Set `modify=FALSE` to protect your edits
- Outdated metadata: Set `modify=TRUE` to force a refresh
- New content: Leave `modify` empty for automatic enrichment

### Step 2: Enrich the CSV with Metadata

Run the enrichment script to automatically fetch metadata:

```bash
python3 scripts/enrich_content.py
```

This script will:
- ✅ Fetch titles, descriptions, thumbnails, dates, and durations
- ✅ Work with YouTube, Meetup, and generic URLs
- ✅ Skip already-enriched rows
- ✅ **NEVER modify** the `type` and `url` columns (they're protected!)

**Example Output:**
```
Content Enrichment Script
============================================================
Reading ./content.csv...
Found 76 rows to process

  ⟳ Enriching [video] https://www.youtube.com/watch?v=...
  ✓ Enriched: 5 Google Sheets Tricks you might not know!
  ⊘ Skipping (already complete): Another Video Title
  ...
```

### Step 3: Generate Markdown Files

Convert the enriched CSV to markdown files for the website:

```bash
python3 scripts/generate_markdown.py
```

This script will:
- ✅ Create markdown files in `src/content/{videos,podcasts,talks,books}/`
- ✅ Skip existing files (won't overwrite)
- ✅ Generate proper frontmatter for Astro
- ✅ Create slugified filenames from titles

**Example Output:**
```
Markdown Generation Script
============================================================
Reading ./content.csv...
Found 76 content items

  ✓ Created: src/content/videos/5-google-sheets-tricks.md
  ⊘ Skipping (already exists): Another Video
  ...

✓ Created 43 new markdown files
⊘ Skipped 31 existing files
```

### Step 4: Review and Adjust (Optional)

1. Review generated files in `src/content/`
2. Add tags manually to CSV (semicolon-separated): `analytics engineering;dbt;data`
3. Adjust descriptions if needed
4. Re-run `generate_markdown.py --force` to regenerate if you made changes

### Step 5: Test Locally

Run the development server to preview:

```bash
npm run dev
```

Visit:
- Videos: http://localhost:4321/videos
- Podcasts: http://localhost:4321/podcasts
- Talks: http://localhost:4321/talks
- Books: http://localhost:4321/books

### Step 6: Commit and Deploy

```bash
git add content.csv src/content/
git commit -m "Add new content"
git push
```

Your CI/CD pipeline will automatically deploy the changes.

## CSV Column Reference

| Column | Description | Protected | Auto-filled |
|--------|-------------|-----------|-------------|
| `type` | Content type (video/podcast/talk/book) | ✅ YES | ❌ No |
| `url` | Content URL | ✅ YES | ❌ No |
| `modify` | Control enrichment (empty/FALSE/TRUE) | ❌ No | ❌ No (manual) |
| `title` | Content title | ❌ No | ✅ Yes |
| `date` | Publication date (YYYY-MM-DD) | ❌ No | ✅ Yes |
| `duration` | Duration (HH:MM:SS or MM:SS) | ❌ No | ✅ Yes |
| `description` | Short description | ❌ No | ✅ Yes |
| `thumbnail` | Thumbnail URL | ❌ No | ✅ Yes |
| `tags` | Semicolon-separated tags | ❌ No | ❌ No (manual) |
| `extra1` | Type-specific field | ❌ No | ⚠️ Varies |
| `extra2` | Type-specific field | ❌ No | ⚠️ Varies |

**Protected columns** are never modified by scripts - you must set them manually.

**Modify column behavior:**
- **Empty** (default): Enrich only if fields are missing
- **FALSE**: Lock row - never enrich (protects customizations)
- **TRUE**: Force refresh - overwrite with fresh metadata (auto-resets to FALSE)

### Extra Fields by Type

- **Videos**: `extra1` = platform (youtube/vimeo), `extra2` = unused
- **Podcasts**: `extra1` = episode number, `extra2` = podcast name
- **Talks**: `extra1` = event name, `extra2` = location
- **Books**: `extra1` = publisher, `extra2` = co-authors (semicolon-separated)

## Tips & Best Practices

### Adding Multiple Items

Add all URLs at once to `content.csv`, then run enrichment once. This is faster than processing one at a time.

### Tags are Important

Tags enable filtering on the website. Add relevant ones manually to your CSV:

```csv
video,https://youtube.com/watch?v=...,My Title,2024-01-01,10:30,Description,...,dbt;analytics;sql,,
```

### Force Regeneration

If you update the CSV and want to regenerate existing markdown files:

```bash
python3 scripts/generate_markdown.py --force
```

### YouTube Shorts

YouTube Shorts (videos under 60 seconds) are automatically filtered out by the enrichment script.

### Manual Edits and the modify Column

You can manually edit any CSV field. To protect your customizations:

1. **Edit the CSV** - Change title, description, or any other field
2. **Set modify=FALSE** - This locks the row from future enrichments
3. **Run the script** - Your custom values are preserved

To refresh stale data:
1. **Set modify=TRUE** - This forces a refresh
2. **Run the script** - Fresh metadata is fetched and modify resets to FALSE

Leave modify empty for smart behavior: enriches only missing fields.

## Troubleshooting

### "YOUTUBE_API_KEY not found"

The enrichment script will still work without an API key, but you'll get limited metadata for YouTube videos. To fix:

1. Get an API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a `.env` file: `cp .env.example .env`
3. Add your key: `YOUTUBE_API_KEY=your_api_key_here`

### "Error: content.csv not found"

Make sure you're running scripts from the project root:

```bash
cd /path/to/Juanalytics
python3 scripts/enrich_content.py
```

### API Quota Exceeded

YouTube API has a free quota of 10,000 units/day (~100 videos). If exceeded:

- Wait 24 hours for reset
- Process content in smaller batches
- Request quota increase from Google

### Missing Dependencies

If you get import errors:

```bash
pip install -r scripts/requirements.txt
```

## Advanced: Bulk Import from YouTube Channel

If you want to import all videos from your YouTube channel at once:

```bash
# Using the legacy script
python3 scripts/legacy/youtube_scraper_api.py \
  --api-key YOUR_KEY \
  --channel-handle @juanmanuelperafan \
  --output youtube_videos.json

# Then manually add URLs to content.csv
```

## File Structure

```
Juanalytics/
├── content.csv                          # Main content database (CSV)
├── .env                                 # API keys (not in git)
├── .env.example                         # Template for .env
├── scripts/
│   ├── enrich_content.py               # Enriches CSV with metadata
│   ├── generate_markdown.py            # Generates markdown from CSV
│   ├── requirements.txt                # Python dependencies
│   ├── README.md                       # Scripts documentation
│   └── legacy/                         # Old scripts (archived)
├── src/
│   ├── content/
│   │   ├── videos/                     # Generated video markdown
│   │   ├── podcasts/                   # Generated podcast markdown
│   │   ├── talks/                      # Generated talk markdown
│   │   └── books/                      # Generated book markdown
│   ├── pages/
│   │   ├── videos.astro                # Videos page
│   │   ├── podcasts.astro              # Podcasts page
│   │   ├── talks.astro                 # Talks page
│   │   └── books.astro                 # Books page
│   └── utils/
│       └── csvParser.ts                # CSV parser utility
└── CONTENT_WORKFLOW.md                 # This file
```

## Summary

The workflow is designed to be simple:

1. **Add URLs** to `content.csv` (2 columns: type, url)
2. **Run enrichment**: `python3 scripts/enrich_content.py`
3. **Generate markdown**: `python3 scripts/generate_markdown.py`
4. **Review, commit, deploy**

The first two columns (`type` and `url`) are **protected** - they'll never be modified by scripts. Everything else is automatically enriched!

---

For more details, see [`scripts/README.md`](scripts/README.md).
