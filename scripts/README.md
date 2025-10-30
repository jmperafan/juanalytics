# Content Management Scripts

This directory contains scripts to manage content for the Juanalytics website.

## Workflow Overview

The workflow for adding new content is:

1. **Add URLs manually** to `content.csv` (first 2 columns: `type` and `url`)
2. **Run enrichment script** to fetch metadata automatically
3. **Run generation script** to create markdown files for the website
4. **Review and adjust** generated files as needed

## Quick Start

### 1. Install Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

### 2. Set Up API Keys

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your YouTube Data API key:

```
YOUTUBE_API_KEY=your_api_key_here
```

Get a free API key at: https://console.cloud.google.com/apis/credentials

### 3. Add Content URLs

Edit `content.csv` and add new rows with just `type` and `url`:

```csv
type,url,modify,title,date,duration,description,thumbnail,tags,extra1,extra2
video,https://www.youtube.com/watch?v=YOUR_VIDEO_ID,,,,,,,,,
podcast,https://www.youtube.com/watch?v=ANOTHER_ID,,,,,,,,,
talk,https://www.meetup.com/event/12345,,,,,,,,,
```

Supported types: `video`, `podcast`, `talk`, `book`

**About the `modify` column:**
- Leave **empty** (default) - Script will enrich only if fields are missing
- Set to **FALSE** - Lock the row, script will never modify it (use when you've customized the content)
- Set to **TRUE** - Force refresh, script will overwrite all fields with fresh metadata (automatically changes to FALSE after enrichment)

### 4. Enrich Content

Run the enrichment script to automatically fetch metadata:

```bash
python scripts/enrich_content.py
```

This will:
- Fetch titles, descriptions, thumbnails, dates, and durations
- **NEVER modify** the `type` and `url` columns (protected)
- Skip already-enriched rows
- Work with YouTube, Meetup, and other URLs

### 5. Generate Markdown Files

Convert the CSV to markdown files:

```bash
python scripts/generate_markdown.py
```

This will:
- Create markdown files in `src/content/{videos,podcasts,talks,books}/`
- Skip existing files (won't overwrite)
- Use proper frontmatter for Astro

### 6. Review and Deploy

1. Review generated files in `src/content/`
2. Manually add tags or adjust descriptions if needed
3. Test locally: `npm run dev`
4. Commit and push

## Main Scripts

### `enrich_content.py`

Enriches `content.csv` with metadata from various sources.

**Features:**
- YouTube Data API integration for full metadata
- Generic web scraping for other URLs
- Protected columns (never modifies `type` and `url`)
- Respects the `modify` column for fine-grained control
- Skips already-complete rows (unless modify=TRUE)

**Usage:**
```bash
python scripts/enrich_content.py
```

**Modify Column Behavior:**
- `modify` is **empty**: Only enriches if fields are missing
- `modify` is **FALSE**: Locks the row, never enriches (protects your custom content)
- `modify` is **TRUE**: Forces refresh, overwrites all fields, then sets to FALSE

### `generate_markdown.py`

Generates markdown files from enriched CSV data.

**Features:**
- Creates files in appropriate directories
- Skips existing files by default
- Generates proper frontmatter for Astro
- Slugifies titles for filenames

**Usage:**
```bash
python scripts/generate_markdown.py

# Force overwrite existing files
python scripts/generate_markdown.py --force
```

## CSV Format

The `content.csv` file has the following columns:

| Column | Description | Protected | Required |
|--------|-------------|-----------|----------|
| `type` | Content type (video/podcast/talk/book) | ✅ Yes | ✅ Yes |
| `url` | Content URL | ✅ Yes | ✅ Yes |
| `modify` | Control enrichment (empty/FALSE/TRUE) | ❌ No | ❌ Optional |
| `title` | Content title | ❌ No | ✅ Yes |
| `date` | Publication date (YYYY-MM-DD) | ❌ No | ⚠️ Recommended |
| `duration` | Duration (HH:MM:SS or MM:SS) | ❌ No | ⚠️ Recommended |
| `description` | Short description | ❌ No | ⚠️ Recommended |
| `thumbnail` | Thumbnail URL | ❌ No | ⚠️ Recommended |
| `tags` | Semicolon-separated tags | ❌ No | ⚠️ Recommended |
| `extra1` | Type-specific field | ❌ No | ❌ Optional |
| `extra2` | Type-specific field | ❌ No | ❌ Optional |

**Protected columns** are NEVER modified by scripts - they must be set manually.

**Modify column values:**
- **Empty** (default): Enrich only if fields are missing
- **FALSE**: Lock row - never enrich (protects your customizations)
- **TRUE**: Force refresh - overwrite all fields with fresh metadata

**Extra fields by type:**
- **Videos**: `extra1` = platform (youtube/vimeo), `extra2` = unused
- **Podcasts**: `extra1` = episode number, `extra2` = podcast name
- **Talks**: `extra1` = event name, `extra2` = location
- **Books**: `extra1` = publisher, `extra2` = co-authors (semicolon-separated)

## Legacy Scripts

The following scripts are kept for reference but are superseded by the new workflow:

- `content-management/enrichCSV.js` - Old Node.js enrichment (use `enrich_content.py`)
- `content-management/scrapeYouTubeChannel.js` - Old channel scraper (use `enrich_content.py`)
- `content-management/extractToCSV.js` - Old markdown-to-CSV converter (no longer needed)
- `youtube_scraper.py`, `youtube_scraper_api.py` - Old Python scrapers (use `enrich_content.py`)
- `generate_content.py` - Old content generator (use `generate_markdown.py`)
- `merge_videos.py`, `auto_classify.py`, `cleanup_shorts.py` - Old maintenance scripts

You can safely delete these if you don't need them.

## Troubleshooting

### "YOUTUBE_API_KEY not found"

Make sure you have:
1. Created a `.env` file in the project root
2. Added `YOUTUBE_API_KEY=your_key` to it
3. Got an API key from Google Cloud Console

### "Error: content.csv not found"

Make sure you're running the scripts from the project root directory:
```bash
cd /path/to/Juanalytics
python scripts/enrich_content.py
```

### YouTube API quota exceeded

The free tier allows 10,000 quota units per day. Each video lookup uses ~3 units.

If you exceed the quota:
- Wait 24 hours for reset
- Process content in batches
- Consider requesting a quota increase from Google

### Missing dependencies

Install all required packages:
```bash
pip install -r scripts/requirements.txt
```

## Tips

1. **Batch Processing**: Add multiple URLs at once, then run enrichment once
2. **Tags**: Tags are used for filtering on the website - add relevant ones!
3. **Descriptions**: Keep them concise (under 200 characters works best)
4. **Manual Edits**: You can edit CSV values manually - scripts won't overwrite them
5. **Git**: Commit the CSV file so you have a history of changes

## Contributing

If you add new URL types or improve the scripts, please update this README!
