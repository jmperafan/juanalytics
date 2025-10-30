# Quick Start Guide

Get your YouTube videos into your site in 3 steps!

## Step 1: Install Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

## Step 2: Scrape Your Channel

**Option A: Use your channel handle (easiest)**

```bash
python youtube_scraper.py --channel-handle @yourhandle
```

**Option B: Use your channel ID**

```bash
python youtube_scraper.py --channel-id UCxxxxxxxxxxxxxxxxxxxxxx
```

This creates `youtube_data.json` with your 15 most recent videos.

## Step 3: Classify Videos

Open `youtube_data.json` and for each video:

1. Set `"type": "video"` or `"type": "podcast"`
2. Add tags: `"tags": ["analytics", "dbt", "tutorial"]`

Example:

```json
{
  "video_id": "abc123",
  "title": "Introduction to dbt",
  "type": "video",
  "tags": ["dbt", "tutorial", "analytics-engineering"]
}
```

## Step 4: Generate Content

```bash
python generate_content.py --input youtube_data.json
```

This creates markdown files in `src/content/videos/` and `src/content/podcasts/`

## Step 5: Review & Deploy

1. Check the generated markdown files
2. Make any edits you want
3. Commit and deploy!

## Need More Than 15 Videos?

Use the API version (requires free YouTube API key):

```bash
# Get API key from: https://console.cloud.google.com/
pip install google-api-python-client google-auth
python youtube_scraper_api.py --api-key YOUR_KEY --channel-handle @yourhandle
```

## Troubleshooting

**Can't find channel?**
- Make sure your channel is public
- Try using channel ID instead of handle

**Import errors?**
- Run: `pip install -r requirements.txt`

**Need help?**
- See full README.md for detailed instructions
