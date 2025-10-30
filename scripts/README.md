# YouTube Channel Scraper Scripts

This folder contains Python scripts to automatically scrape video data from your YouTube channel and generate content for your Astro site.

**NO API KEY REQUIRED!** This uses YouTube's free RSS feeds.

## Three Approaches

### 1. GitHub Action (RECOMMENDED - Fully Automated!)

- ⚡ **Automatic weekly updates** via GitHub Action
- Scrapes videos, auto-classifies, creates PRs
- Zero maintenance - just review and merge!
- See [GITHUB_ACTION.md](GITHUB_ACTION.md)

### 2. Quick Start (RSS - Free, No API Key)

- Get your 15 most recent videos instantly
- Perfect for small channels or getting started
- See [QUICK_START.md](QUICK_START.md)

### 3. Complete Workflow (API + RSS)

- Get ALL videos once with API (free tier)
- Then use RSS for ongoing updates
- Best for channels with many videos
- See [INCREMENTAL_WORKFLOW.md](INCREMENTAL_WORKFLOW.md)

## Overview

The workflow consists of two main steps:

1. **Scrape YouTube data** - Fetch video metadata from your YouTube channel
2. **Generate content files** - Convert the data into markdown files for your site

## Prerequisites

1. **Python 3.7+** installed on your system
2. **Your YouTube Channel ID or Handle** (e.g., @yourhandle)

### Finding Your Channel ID

#### Method 1: From Your Channel URL

- If your URL is `youtube.com/@yourhandle`, you have a handle
- If your URL is `youtube.com/channel/UCxxxxxx`, that's your channel ID

#### Method 2: Let the Script Find It

- Just use your handle with `--channel-handle @yourhandle`
- The script will automatically look up your channel ID

## Installation

1. Navigate to the scripts folder:

   ```bash
   cd scripts
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Step 1: Scrape YouTube Channel Data

Run the scraper to fetch videos from your YouTube channel:

```bash
python youtube_scraper.py --channel-handle @YourChannelHandle
```

**Options:**

- `--channel-handle`: Your YouTube handle (e.g., @juanalytics)
- `--channel-id`: Alternative to handle, use channel ID (e.g., UCxxxxxx)
- `--output`: Output JSON file name (default: `youtube_data.json`)

**Example:**

```bash
python youtube_scraper.py --channel-handle @juanalytics --output my_videos.json
```

This will create a JSON file with your video data.

**Note:** RSS feeds return the most recent 15 videos. If you need more videos, you can get a free YouTube Data API key from [Google Cloud Console](https://console.cloud.google.com/) and use the official API (50 videos with free tier).

### Step 2: Classify Your Videos

Open the generated JSON file (e.g., `youtube_data.json`) and update each video:

1. **Set the `type` field**: `"video"` or `"podcast"`
2. **Add relevant tags**: Update the `tags` array with relevant keywords

**Example JSON entry:**

```json
{
  "video_id": "dQw4w9WgXcQ",
  "title": "Introduction to dbt",
  "description": "Learn the basics of dbt...",
  "published_date": "2024-01-15",
  "thumbnail_url": "https://i.ytimg.com/vi/...",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "channel_title": "Juanalytics",
  "type": "video",
  "tags": ["dbt", "analytics-engineering", "tutorial"]
}
```

### Step 3: Generate Content Files

Once you've classified your videos, generate the markdown files:

```bash
python generate_content.py --input youtube_data.json
```

**Options:**

- `--input` (required): Input JSON file from step 1
- `--content-dir`: Path to content directory (default: `../src/content`)
- `--overwrite`: Overwrite existing markdown files

**Example:**

```bash
python generate_content.py --input my_videos.json --overwrite
```

This will create markdown files in:

- `src/content/videos/` for videos
- `src/content/podcasts/` for podcasts

### Step 4: Review and Publish

1. Review the generated markdown files
2. Make any manual edits as needed
3. Commit the changes to your repository
4. Deploy your site

## File Structure

```text
scripts/
├── README.md                 # This file
├── requirements.txt          # Python dependencies (RSS version)
├── youtube_scraper.py       # YouTube RSS scraper (NO API KEY)
├── youtube_scraper_api.py   # YouTube API scraper (OPTIONAL, needs API key)
├── generate_content.py      # Markdown content generator
├── example_data.json        # Example JSON format
└── youtube_data.json        # Generated data (gitignored)
```

## Tips

- **RSS Limitation**: RSS feeds only return 15 videos. For more videos, consider using the YouTube Data API (free tier allows 50 videos)
- **Backup**: Keep your JSON file as a backup before generating content
- **Incremental Updates**: To add only new videos, you can manually remove already-processed entries from the JSON file
- **Custom Fields**: You can manually add custom fields to the JSON and update the `generate_content.py` script to use them

## Troubleshooting

### "Channel not found" error

- Double-check your channel handle or ID
- Try using the channel ID directly instead of the handle
- Verify the channel is public

### No videos found

- Make sure your channel has public videos
- Check if the RSS feed works directly: `https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID`

### Import errors

- Make sure you've installed dependencies: `pip install -r requirements.txt`
- Check your Python version: `python --version` (should be 3.7+)

## Advanced Usage

### Getting More Than 15 Videos

If you need more than 15 videos, you have two options:

#### Option 1: Use YouTube Data API (Recommended)

1. Get a free API key from [Google Cloud Console](https://console.cloud.google.com/)
2. The free tier allows 10,000 quota units per day
3. Install additional dependencies: `pip install google-api-python-client google-auth`
4. Use the API scraper: `python youtube_scraper_api.py --api-key YOUR_KEY --channel-handle @yourhandle`

#### Option 2: Manual Batching

1. Run the scraper periodically (e.g., weekly)
2. Merge the new JSON data with your existing data
3. This way you build up a complete history over time

### Automation

You can automate this workflow with a cron job or GitHub Action to periodically:

1. Scrape new videos
2. Auto-classify based on patterns (e.g., title keywords)
3. Generate content
4. Create a pull request

## Limitations

- RSS feeds only return the 15 most recent videos
- Descriptions in RSS feeds may be truncated
- No view counts, likes, or other engagement metrics
- For more data, use the official YouTube Data API

## Support

For issues or questions:

- Check the [YouTube RSS documentation](https://developers.google.com/youtube/v3/guides/implementation/subscribing)
- Review your site's content structure in `src/content/`
