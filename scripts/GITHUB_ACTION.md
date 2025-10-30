# GitHub Action: Automatic YouTube Updates

Your site now automatically updates with new YouTube videos every week!

## What It Does

The GitHub Action (`.github/workflows/update-youtube-videos.yml`) automatically:

1. **Scrapes** your YouTube channel for videos using the API
2. **Merges** with existing classified videos (preserves your work)
3. **Auto-classifies** new videos as 'video' or 'podcast'
4. **Generates** markdown content files
5. **Creates a Pull Request** with the changes for you to review

## Setup (One-Time)

### Step 1: Configure Your Channel

Edit [scripts/config.json](config.json) and update your channel handle:

```json
{
  "channel": {
    "handle": "@yourhandle"
  }
}
```

### Step 2: Verify the Secret

Your API key is already configured as `YOUTUBE_DATA_API_KEY` in GitHub Secrets. ✓

You can verify it's there:
1. Go to your repo Settings
2. Secrets and variables → Actions
3. Confirm `YOUTUBE_DATA_API_KEY` exists

## How to Use

### Automatic Weekly Updates

The action runs **every Monday at 9 AM UTC** automatically.

You'll get a PR with new videos to review!

### Manual Trigger (Anytime)

1. Go to your repo on GitHub
2. Click "Actions" tab
3. Select "Update YouTube Videos" workflow
4. Click "Run workflow" button
5. Click "Run workflow" to confirm

### Review the PR

When the action runs, it creates a PR with:
- New video content files
- Updated `scripts/classified_videos.json`
- Summary of changes

**Review checklist:**
1. Check that videos are classified correctly
2. Update tags if needed
3. Merge the PR when ready!

## Auto-Classification Rules

Edit [scripts/config.json](config.json) to customize:

```json
{
  "auto_classification": {
    "enabled": true,
    "rules": {
      "podcast": {
        "keywords": ["podcast", "episode", "interview", "conversation"],
        "tags": ["podcast"]
      },
      "video": {
        "default": true,
        "tags": []
      }
    }
  }
}
```

**How it works:**
- If title or description contains podcast keywords → classified as "podcast"
- Otherwise → classified as "video"

### Improving Classification

You can add more rules by editing the workflow directly or the config file:

**Example: Add tutorial detection**

```json
{
  "tutorial": {
    "keywords": ["tutorial", "how to", "guide", "lesson"],
    "tags": ["tutorial", "education"]
  }
}
```

Then update `auto_classify.py` to handle the new type.

## Changing the Schedule

Edit `.github/workflows/update-youtube-videos.yml`:

```yaml
schedule:
  - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
```

**Common schedules:**
- Daily: `'0 9 * * *'`
- Weekly (Wednesday): `'0 9 * * 3'`
- Monthly (1st): `'0 9 1 * *'`

Use [crontab.guru](https://crontab.guru/) to create custom schedules.

## Troubleshooting

### Action fails with "API key" error

- Verify the secret exists in repo Settings → Secrets
- Make sure it's named exactly `YOUTUBE_DATA_API_KEY`

### No PR created

- Check if there are actually new videos
- Look at the action logs for details
- The action only creates PRs if there are changes

### Wrong channel being scraped

- Update `scripts/config.json` with correct channel handle
- Commit and push the change

### Want to disable auto-classification

Edit `scripts/config.json`:

```json
{
  "auto_classification": {
    "enabled": false
  }
}
```

## Files Involved

- **`.github/workflows/update-youtube-videos.yml`** - Main workflow
- **`scripts/config.json`** - Configuration (channel, rules)
- **`scripts/youtube_scraper_api.py`** - Fetches videos
- **`scripts/merge_videos.py`** - Merges with existing data
- **`scripts/auto_classify.py`** - Auto-classifies videos
- **`scripts/generate_content.py`** - Creates markdown files

## Manual Override

If you want to manually update without waiting for the schedule:

```bash
# Local testing
cd scripts
python youtube_scraper_api.py --api-key YOUR_KEY --channel-handle @you --output new.json
python merge_videos.py --existing classified_videos.json --new new.json --output merged.json
python auto_classify.py --input merged.json --output classified_videos.json
python generate_content.py --input classified_videos.json --overwrite
```

## Advanced: Customize PR Message

Edit the workflow file and modify the `Create Pull Request` step's `body` field.

## FAQ

**Q: Will this overwrite my manual classifications?**

No! The merge step preserves existing `type` and `tags`. Only new unclassified videos get auto-classified.

**Q: Can I classify videos manually after auto-classification?**

Yes! Edit `scripts/classified_videos.json` directly and commit.

**Q: How much does this cost?**

- GitHub Actions: Free for public repos
- YouTube API: Free tier (10,000 quota units/day)
- Total cost: $0

**Q: What if I hit API quota limits?**

Very unlikely! The free tier allows ~100+ videos per request. You'd need thousands of videos.

**Q: Can I turn off the workflow?**

Yes! Disable it in the Actions tab, or delete the workflow file.

## Success!

You now have a fully automated video update system! 🎉

New videos will automatically appear on your site every week. Just review the PR and merge!
