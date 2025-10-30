# Incremental Workflow Guide

Perfect for maintaining your site with new videos over time!

## Strategy

1. **First time**: Fetch ALL videos using the API (with API key)
2. **Ongoing**: Use the free RSS feed (15 videos) to catch new uploads
3. **Merge**: Combine new videos with your existing classified data

## Initial Setup (Do This Once)

### Step 1: Get ALL Your Videos

```bash
cd scripts
pip install google-api-python-client google-auth

# Fetch ALL videos (requires API key - free from console.cloud.google.com)
python youtube_scraper_api.py --api-key YOUR_KEY --channel-handle @yourhandle --output all_videos.json
```

This gets every video from your channel through pagination.

### Step 2: Classify ALL Videos

Open `all_videos.json` and classify each video:

```json
{
  "video_id": "abc123",
  "title": "My Video",
  "type": "video",           // ← Add this
  "tags": ["analytics"]      // ← Add this
}
```

Save as `classified_videos.json` when done.

### Step 3: Generate Initial Content

```bash
python generate_content.py --input classified_videos.json
```

## Ongoing Updates (Weekly/Monthly)

When you upload new videos, use the FREE RSS feed:

### Step 1: Scrape New Videos (No API Key!)

```bash
# Just install the basic dependencies
pip install -r requirements.txt

# Fetch the 15 most recent videos (FREE, no API key)
python youtube_scraper.py --channel-handle @yourhandle --output new_videos.json
```

### Step 2: Merge with Existing Data

```bash
python merge_videos.py \
  --existing classified_videos.json \
  --new new_videos.json \
  --output updated_videos.json
```

This will:
- Keep all your old videos and classifications
- Add any truly new videos
- Preserve your existing type/tags

### Step 3: Classify New Videos Only

Open `updated_videos.json` and look for videos with empty `type` field - those are new!

Classify just those new ones, then save as `classified_videos.json` (overwrite the old one).

### Step 4: Generate Content

```bash
python generate_content.py --input classified_videos.json --overwrite
```

## Example Timeline

**Week 1:**
```bash
# Get ALL videos once (requires API key)
python youtube_scraper_api.py --api-key KEY --channel-handle @me
# Classify all → classified_videos.json
python generate_content.py --input classified_videos.json
```

**Week 2-N:** (New video published)
```bash
# Get recent 15 (FREE, no API key!)
python youtube_scraper.py --channel-handle @me --output new.json

# Merge with existing
python merge_videos.py --existing classified_videos.json --new new.json --output updated.json

# Classify the 1-2 new videos
# ... edit updated.json ...

# Overwrite classified_videos.json with updated.json
mv updated.json classified_videos.json

# Generate content
python generate_content.py --input classified_videos.json --overwrite
```

## Tips

**File Management:**
- Keep `classified_videos.json` as your "source of truth"
- You can delete `new_videos.json` and `all_videos.json` after merging
- Back up `classified_videos.json` before major changes

**How Often to Update:**
- RSS feed shows 15 most recent, so update before you publish 15+ new videos
- For most channels: monthly or quarterly is fine

**When to Use API vs RSS:**
- **API** (one-time): Initial setup, or if you haven't updated in months
- **RSS** (ongoing): Regular updates, it's free and unlimited

**Automation Idea:**
```bash
#!/bin/bash
# weekly-update.sh
python youtube_scraper.py --channel-handle @me --output new.json
python merge_videos.py --existing classified_videos.json --new new.json --output temp.json
# Then manually classify new videos
```

## Quota Considerations

**YouTube API (one-time setup):**
- Free tier: 10,000 units/day
- Fetching videos: ~1-3 units per video
- You can get 100+ videos per day easily

**RSS Feed (ongoing):**
- No quota limits
- Unlimited requests
- Always returns 15 most recent

## Questions?

**Q: What if I have 200+ videos?**

A: Use the API scraper for the initial fetch (it paginates through all videos). After that, use RSS for updates.

**Q: I forgot to update and published 20 new videos. RSS only shows 15!**

A: Run the API scraper one more time to catch up, then resume using RSS.

**Q: Can I automate the classification?**

A: Yes! Add logic to auto-classify based on title patterns:
- If title contains "Podcast" → type: "podcast"
- If title contains "Tutorial" → tags: ["tutorial"]

See README.md for automation examples.
