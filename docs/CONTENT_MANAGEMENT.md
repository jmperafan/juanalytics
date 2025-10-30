# CSV-Based Content Management System

This project uses a CSV file as the single source of truth for all content (videos, podcasts, talks, and books).

## Overview

Instead of managing individual markdown files for each piece of content, you now manage everything through a single `content.csv` file at the root of your project. This approach makes it much easier to:

- Add new content quickly (just add a row with the URL)
- Bulk import/export content
- Track all your content in one place
- Automatically extract metadata from URLs

## CSV File Structure

The `content.csv` file has the following columns:

| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| `type` | Content type | Yes | `video`, `podcast`, `talk`, or `book` |
| `url` | The URL of the content | Yes | `https://youtube.com/watch?v=...` |
| `title` | Title of the content | Auto* | `My Amazing Video` |
| `date` | Publication date | Auto* | `2024-01-15` |
| `duration` | Duration (for videos/podcasts) | Auto* | `15:30` |
| `description` | Content description | Auto* | `Description here...` |
| `thumbnail` | Thumbnail or cover image URL | Auto* | `https://...jpg` |
| `tags` | Semicolon-separated tags | No | `analytics;sql;dbt` |
| `extra1` | Type-specific field (see below) | No | Varies by type |
| `extra2` | Type-specific field (see below) | No | Varies by type |

*Auto = Can be automatically extracted by the enrichment script

### Type-Specific Extra Fields

Different content types use `extra1` and `extra2` for different purposes:

#### Videos
- `extra1`: Platform (`youtube`, `vimeo`, or `other`)
- `extra2`: Not used

#### Podcasts
- `extra1`: Episode number (e.g., `5`)
- `extra2`: Podcast name (e.g., `SQL Lingua Franca`)

#### Talks
- `extra1`: Event name (e.g., `Coalesce 2025`)
- `extra2`: Location (e.g., `Berlin, Germany`)

#### Books
- `extra1`: Publisher (e.g., `O'Reilly`)
- `extra2`: Co-authors, semicolon-separated (e.g., `Jane Doe;John Smith`)

## Quick Start Guide

### 1. Add Content to CSV

Simply add a new row to `content.csv` with at least the `type` and `url`:

```csv
type,url,title,date,duration,description,thumbnail,tags,extra1,extra2
video,https://youtube.com/watch?v=abc123,,,,,,,youtube,
podcast,https://spotify.com/episode/xyz789,,,,,,,5,SQL Lingua Franca
```

### 2. Extract Metadata (Optional but Recommended)

Run the enrichment script to automatically fetch titles, descriptions, thumbnails, etc.:

```bash
node scripts/content-management/enrichCSV.js
```

The script will:
- Fetch metadata from YouTube URLs automatically
- Update your CSV with the extracted information
- Skip items that already have complete information
- Show progress as it processes each URL

### 3. Manual Editing

After running the script, open `content.csv` and:
- Fill in any missing information
- Add tags (semicolon-separated: `tag1;tag2;tag3`)
- Add type-specific information to `extra1` and `extra2`
- Adjust descriptions as needed

### 4. Build and Preview

```bash
npm run dev
```

Your website will now display all content from the CSV file!

## Example CSV Entries

### Video Example
```csv
video,https://youtube.com/watch?v=dQw4w9WgXcQ,Introduction to dbt,2024-01-15,12:45,Learn the basics of dbt in this tutorial,https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg,dbt;tutorial;analytics,youtube,
```

### Podcast Example
```csv
podcast,https://open.spotify.com/episode/abc123,Episode 10: Data Quality,2024-02-20,45:30,Discussion about data quality best practices,https://example.com/cover.jpg,data-quality;podcast,10,My Podcast Show
```

### Talk Example
```csv
talk,https://youtube.com/watch?v=xyz789,Analytics Engineering at Scale,2023-11-15,,Conference talk about scaling analytics,https://example.com/thumb.jpg,analytics-engineering;conference,dbt Coalesce 2023,San Diego USA
```

### Book Example
```csv
book,https://amazon.com/dp/B0123456,Fundamentals of Analytics Engineering,2024-03-01,,Comprehensive guide to analytics engineering,https://example.com/cover.jpg,book;analytics,O'Reilly,Jane Doe;John Smith
```

## Tips and Best Practices

### Tags
- Use semicolons (`;`) to separate tags, not commas
- Keep tags lowercase and use hyphens for multi-word tags
- Example: `analytics-engineering;dbt;sql`

### Dates
- Use ISO format: `YYYY-MM-DD` (e.g., `2024-01-15`)
- The system will parse various date formats, but ISO is most reliable

### Descriptions
- If your description contains commas, the enrichment script will handle quoting automatically
- Keep descriptions concise (1-2 sentences) for better display

### URLs
- YouTube URLs work best with the auto-enrichment
- For other platforms, you'll need to fill in metadata manually
- Always use the full URL, not shortened links

### Workflow
1. **Quick Add**: Add just type and URL to CSV
2. **Enrich**: Run `node scripts/content-management/enrichCSV.js`
3. **Review**: Check and edit the CSV manually
4. **Test**: Run `npm run dev` to preview
5. **Commit**: Commit the updated CSV to git

## Migrating Existing Content

If you want to migrate your existing markdown files to CSV:

1. Create a row for each markdown file
2. Copy the frontmatter data to the appropriate CSV columns
3. Map the markdown fields to CSV columns:
   - `title` → `title`
   - `pubDate` → `date`
   - `description` → `description`
   - `videoUrl/audioUrl/amazonUrl` → `url`
   - `thumbnail/coverImage` → `thumbnail`
   - `tags` → `tags` (join with semicolons)
   - Other fields → `extra1`/`extra2` based on type

## Troubleshooting

### CSV not loading
- Check that `content.csv` is in the root directory
- Ensure the headers match exactly: `type,url,title,date,duration,description,thumbnail,tags,extra1,extra2`
- Look for syntax errors (unclosed quotes, wrong number of columns)

### Metadata not extracting
- Verify the URL is correct and accessible
- YouTube URLs need to be in standard format: `https://youtube.com/watch?v=VIDEO_ID`
- Check your internet connection
- Some platforms may not be supported yet

### Content not displaying
- Run `npm run dev` and check the console for errors
- Verify the CSV has valid data
- Check that dates are in valid format
- Ensure the `type` column matches exactly: `video`, `podcast`, `talk`, or `book`

## Advanced Usage

### Extending the Enrichment Script

To add support for more platforms, edit `scripts/content-management/enrichCSV.js`:

1. Add a new function to extract the platform's video/content ID
2. Add a function to fetch metadata from that platform's API
3. Update the `enrichRow` function to check for your new platform

### Custom Fields

If you need more than 2 extra fields:
1. Add new columns to the CSV (e.g., `extra3`, `extra4`)
2. Update `src/utils/csvParser.ts` to include the new fields
3. Update the page components to use the new fields

## File Structure

```
.
├── content.csv                      # Single source of truth for all content
├── docs/
│   └── CONTENT_MANAGEMENT.md        # This documentation file
├── scripts/
│   └── content-management/
│       ├── enrichCSV.js             # Script to extract metadata from URLs
│       └── README.md                # Content management scripts documentation
├── src/
│   ├── utils/
│   │   └── csvParser.ts             # CSV parsing utility
│   └── pages/
│       ├── videos.astro             # Videos page (reads from CSV)
│       ├── podcasts.astro           # Podcasts page (reads from CSV)
│       ├── talks.astro              # Talks page (reads from CSV)
│       └── books.astro              # Books page (reads from CSV)
```

## Future Enhancements

Possible improvements you could make:

- Add support for more video platforms (Vimeo, Wistia, etc.)
- Add support for podcast platforms (Spotify, Apple Podcasts)
- Create a web interface for managing the CSV
- Add validation script to check CSV integrity
- Generate thumbnails automatically for missing images
- Add search and filtering capabilities
- Export to different formats (JSON, XML, etc.)

---

**Questions or issues?** Check the troubleshooting section above or open an issue in your repository.
