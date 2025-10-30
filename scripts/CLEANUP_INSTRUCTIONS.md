# Cleanup Instructions: Remove YouTube Shorts

Your existing `classified_videos.json` contains YouTube Shorts (videos under 60 seconds) that need to be removed. Additionally, some "SQL Lingua Franca" videos are incorrectly classified.

## Quick Fix

Run this command from the `scripts` directory:

```bash
cd scripts

# Set your YouTube API key
export YOUTUBE_API_KEY="your_api_key_here"

# Run the cleanup script
python cleanup_shorts.py \
  --api-key "$YOUTUBE_API_KEY" \
  --input classified_videos.json \
  --output classified_videos.json \
  --config config.json
```

**Note:** This will overwrite your existing `classified_videos.json` file.

## What the Script Does

1. ✅ Fetches duration data for all existing videos
2. ✅ Removes videos under 60 seconds (Shorts)
3. ✅ Re-classifies "SQL Lingua Franca" videos as podcasts
4. ✅ Adds duration metadata to all remaining videos

## After Running Cleanup

Once you've cleaned up your existing data:

1. Commit the changes:
   ```bash
   git add classified_videos.json
   git commit -m "Remove YouTube Shorts and re-classify videos"
   git push
   ```

2. Regenerate your content files:
   ```bash
   python generate_content.py \
     --input classified_videos.json \
     --content-dir ../src/content \
     --overwrite
   ```

3. Commit the updated content:
   ```bash
   git add ../src/content
   git commit -m "Regenerate content after removing shorts"
   git push
   ```

## Future Updates

The GitHub Action workflow has been updated to automatically:
- Filter out Shorts from new videos
- Classify "SQL Lingua Franca" as podcasts

So you won't need to run this cleanup script again. Future automated updates will only fetch videos longer than 60 seconds!

## Verification

After running the cleanup, you can verify the results:

```bash
# Count total videos
jq 'length' classified_videos.json

# Count videos by type
jq '[.[] | select(.type == "video")] | length' classified_videos.json
jq '[.[] | select(.type == "podcast")] | length' classified_videos.json

# Check for any "SQL Lingua Franca" videos still classified as video
jq '[.[] | select(.type == "video" and (.title | contains("SQL Lingua Franca")))]' classified_videos.json
```
