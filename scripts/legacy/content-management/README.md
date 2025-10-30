# Content Management Scripts

This directory contains scripts for managing your CSV-based content system.

## Scripts

### scrapeYouTubeChannel.js

Automatically fetches all videos from your YouTube channel and adds them to `content.csv`.

**Usage:**
```bash
# Set your YouTube API key
export YOUTUBE_API_KEY=your_api_key_here

# Or create a .env file with YOUTUBE_API_KEY=your_key

# Run the script
node scripts/content-management/scrapeYouTubeChannel.js
```

**What it does:**
- Fetches all videos from your YouTube channel using YouTube Data API v3
- Automatically filters out YouTube Shorts (videos under 60 seconds)
- Extracts comprehensive metadata:
  - Title
  - Publication date
  - Duration
  - Description (truncated to 150 characters)
  - Thumbnail URL (highest quality available)
- Avoids duplicates by checking existing URLs in the CSV
- Sorts videos by date (newest first)
- Handles pagination to fetch all videos regardless of count

**Requirements:**
- Node.js (no external dependencies needed)
- YouTube Data API v3 key (get one at [Google Cloud Console](https://console.cloud.google.com/apis/credentials))
- Internet connection

**Example workflow:**
```bash
# 1. Get your YouTube API key
# Visit: https://console.cloud.google.com/apis/credentials
# Enable YouTube Data API v3
# Create an API key

# 2. Set the API key
export YOUTUBE_API_KEY=your_api_key_here

# 3. Run the scraper
node scripts/content-management/scrapeYouTubeChannel.js

# 4. Review the updated content.csv
# 5. Test with npm run dev
```

### enrichCSV.js

Automatically extracts metadata from URLs and enriches your `content.csv` file.

**Usage:**
```bash
node scripts/content-management/enrichCSV.js
```

**What it does:**
- Reads the `content.csv` file from the project root
- For each row with a URL, attempts to fetch metadata
- Currently supports:
  - YouTube videos (via oEmbed API - no API key needed)
  - More platforms can be added
- Updates the CSV with:
  - Title
  - Description
  - Thumbnail URL
  - Author information (when available)
- Skips rows that already have complete information
- Adds a 500ms delay between requests to avoid rate limiting

**Requirements:**
- Node.js (no external dependencies needed)
- Internet connection
- Valid URLs in your CSV

**Example workflow:**
```bash
# 1. Add URLs to content.csv
echo "video,https://youtube.com/watch?v=abc123,,,,,,,youtube," >> content.csv

# 2. Run the enrichment script
node scripts/content-management/enrichCSV.js

# 3. Review and edit the updated CSV
# 4. Test with npm run dev
```

## Adding Support for More Platforms

To add support for additional content platforms:

1. **Add a URL parser** for the platform:
```javascript
function extractPlatformId(url) {
  const match = url.match(/platform\.com\/video\/([^&\s]+)/);
  return match ? match[1] : null;
}
```

2. **Add a metadata fetcher**:
```javascript
async function fetchPlatformMetadata(url) {
  const videoId = extractPlatformId(url);
  if (!videoId) return null;

  try {
    // Use the platform's API or oEmbed endpoint
    const apiUrl = `https://platform.com/api/oembed?url=${encodeURIComponent(url)}`;
    const data = await fetchJSON(apiUrl);

    return {
      title: data.title,
      thumbnail: data.thumbnail_url,
      description: data.description,
    };
  } catch (error) {
    console.error(`Error fetching metadata:`, error.message);
    return null;
  }
}
```

3. **Update the enrichRow function**:
```javascript
async function enrichRow(row) {
  // ... existing code ...

  // Add your platform check
  if (url.includes('platform.com')) {
    metadata = await fetchPlatformMetadata(url);
  }

  // ... rest of function ...
}
```

## Future Script Ideas

Consider adding these scripts to this directory:

- **validateCSV.js** - Validate CSV structure and required fields
- **migrateFromMarkdown.js** - Convert existing markdown files to CSV
- **exportToJSON.js** - Export CSV to JSON format
- **generateThumbnails.js** - Generate missing thumbnails
- **bulkImport.js** - Import content from various sources
- **syncFromPlatform.js** - Sync with YouTube/podcast platforms

## Documentation

For complete documentation on the CSV content management system, see:
- [docs/CONTENT_MANAGEMENT.md](../../docs/CONTENT_MANAGEMENT.md)

## Troubleshooting

**Script fails with "CSV not found":**
- Ensure you're running from the project root
- Check that `content.csv` exists in the project root

**No metadata extracted:**
- Verify URLs are correct and accessible
- Check your internet connection
- Some platforms may not be supported yet

**Rate limiting errors:**
- The script includes delays between requests
- If you still hit limits, increase the delay in the script
- Consider running in smaller batches

## Contributing

When adding new scripts:
1. Add clear usage instructions in this README
2. Include error handling
3. Add progress logging
4. Test with sample data
5. Update the main documentation if needed
