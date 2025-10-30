# Quick Setup: GitHub Action for YouTube Updates

Get your automated video updates running in 5 minutes!

## Step 1: Update Your Channel Handle

Edit [config.json](config.json):

```json
{
  "channel": {
    "handle": "@yourhandle"
  }
}
```

Replace `@yourhandle` with your actual YouTube channel handle.

## Step 2: Verify the GitHub Secret

Your API key (`YOUTUBE_DATA_API_KEY`) is already configured! ✓

To verify:
1. Go to your repo on GitHub
2. Settings → Secrets and variables → Actions
3. Confirm `YOUTUBE_DATA_API_KEY` exists

## Step 3: Commit and Push

```bash
git add .github/workflows/update-youtube-videos.yml
git add scripts/config.json
git add scripts/auto_classify.py
git add scripts/classified_videos.json
git commit -m "Add automated YouTube video updates via GitHub Action"
git push
```

## Step 4: Test It!

### Option A: Manual Trigger (Recommended for first run)

1. Go to GitHub → Actions tab
2. Click "Update YouTube Videos"
3. Click "Run workflow" → "Run workflow"
4. Wait 1-2 minutes
5. Check for a new Pull Request!

### Option B: Wait for Monday 9 AM UTC

The workflow runs automatically every Monday morning.

## What Happens Next?

1. **GitHub Action runs** (weekly or manually)
2. **Scrapes your YouTube** channel for all videos
3. **Auto-classifies** them as video/podcast
4. **Creates a Pull Request** with:
   - New content markdown files
   - Updated classified_videos.json

5. **You review the PR**:
   - Check classifications are correct
   - Merge when happy!

6. **Your site deploys** automatically with new videos

## Customization

### Change Schedule

Edit `.github/workflows/update-youtube-videos.yml`:

```yaml
schedule:
  - cron: '0 9 * * 1'  # Change this line
```

### Improve Auto-Classification

Edit `scripts/config.json` to add keywords:

```json
{
  "auto_classification": {
    "rules": {
      "podcast": {
        "keywords": ["podcast", "episode", "interview", "talk", "chat"]
      }
    }
  }
}
```

## Troubleshooting

### No PR created after running action

Check the action logs:
1. Go to Actions tab
2. Click the workflow run
3. Read the output

Common reasons:
- No new videos found (that's okay!)
- API key issue (check the secret)

### Videos classified incorrectly

Two options:
1. **Improve auto-classification**: Edit `config.json` keywords
2. **Manual fix**: Edit the PR's `classified_videos.json` before merging

## Next Steps

1. Run the action manually once to test
2. Review the PR it creates
3. Merge when ready
4. Enjoy automated updates every week!

## Need Help?

- Full docs: [GITHUB_ACTION.md](GITHUB_ACTION.md)
- Manual workflow: [INCREMENTAL_WORKFLOW.md](INCREMENTAL_WORKFLOW.md)
- API reference: [README.md](README.md)

---

**Pro Tip**: After the first run, you can manually edit `scripts/classified_videos.json` to improve classifications, then let the automation handle new videos going forward!
