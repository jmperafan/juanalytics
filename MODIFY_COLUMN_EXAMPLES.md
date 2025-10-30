# The `modify` Column - Examples and Use Cases

The `modify` column gives you fine-grained control over which rows the enrichment script updates.

## How It Works

| modify value | Behavior |
|--------------|----------|
| **Empty** (default) | Smart mode: enriches only if fields are missing |
| **FALSE** | Locked: never enriches this row (protects customizations) |
| **TRUE** | Force refresh: overwrites all fields with fresh metadata, then resets to FALSE |

## Example Scenarios

### Scenario 1: Protecting Custom Titles and Descriptions

You've customized a video's title and description to better match your website's style:

**Before enrichment:**
```csv
type,url,modify,title,description
video,https://youtube.com/watch?v=abc123,,My Custom Title,My carefully crafted description
```

**Problem:** Without `modify=FALSE`, the script might skip it (if complete) or change it later.

**Solution:** Set `modify=FALSE` to lock it:
```csv
type,url,modify,title,description
video,https://youtube.com/watch?v=abc123,FALSE,My Custom Title,My carefully crafted description
```

**Result:** 
```
🔒 Locked (modify=FALSE): My Custom Title
```
Your custom content is preserved forever!

---

### Scenario 2: Refreshing Outdated Metadata

A video's thumbnail or description was updated on YouTube, and you want the latest version:

**Before:**
```csv
type,url,modify,title,description,thumbnail
video,https://youtube.com/watch?v=def456,,Old Title,Old description,old-thumb.jpg
```

**Solution:** Set `modify=TRUE` to force refresh:
```csv
type,url,modify,title,description,thumbnail
video,https://youtube.com/watch?v=def456,TRUE,Old Title,Old description,old-thumb.jpg
```

**After enrichment:**
```csv
type,url,modify,title,description,thumbnail
video,https://youtube.com/watch?v=def456,FALSE,New Title,Updated description,new-thumb.jpg
```

**Result:**
```
🔄 Forcing refresh (modify=TRUE): https://youtube.com/watch?v=def456...
✓ Enriched: New Title
```

The script fetches fresh data and automatically sets `modify=FALSE` to prevent continuous re-enrichment.

---

### Scenario 3: New Content (Default Behavior)

You've added a new video URL with no metadata:

```csv
type,url,modify,title,description,thumbnail
video,https://youtube.com/watch?v=ghi789,,,,,
```

**Result:**
```
⟳ Enriching [video] https://youtube.com/watch?v=ghi789...
✓ Enriched: Amazing Video Title
```

The script automatically enriches because fields are missing. Leave `modify` empty for this smart behavior.

---

### Scenario 4: Partially Complete Content

You have some fields filled but others are missing:

```csv
type,url,modify,title,description,thumbnail
video,https://youtube.com/watch?v=jkl012,,My Title,,,
```

**With modify empty:**
- The script sees `title` is filled but `description` and `thumbnail` are missing
- It enriches only the missing fields
- Your custom title is preserved

**Result:**
```
⟳ Enriching [video] https://youtube.com/watch?v=jkl012...
✓ Enriched: My Title
```

Your title stays "My Title", but description and thumbnail are filled automatically.

---

## Real-World Workflow Examples

### Workflow 1: Batch Import with Selective Customization

```csv
type,url,modify,title,description
video,https://youtube.com/watch?v=aaa,,,
video,https://youtube.com/watch?v=bbb,,,
video,https://youtube.com/watch?v=ccc,,,
```

1. Run enrichment - all get auto-filled
2. Manually edit one video's description to be more engaging
3. Set that video's `modify=FALSE` to protect your edit
4. Future enrichments won't touch the locked row

### Workflow 2: Annual Refresh

Once a year, you want to refresh all metadata to ensure it's current:

```bash
# Set all rows to TRUE using a script or find/replace
# Run enrichment
python3 scripts/enrich_content.py

# All rows get refreshed and automatically set back to FALSE
# Review and lock any you want to customize
```

### Workflow 3: Mixed Content Management

```csv
type,url,modify,title,description
video,https://youtube.com/watch?v=v1,FALSE,Custom Title 1,Custom Desc 1
video,https://youtube.com/watch?v=v2,,Auto Title 2,Auto Desc 2
video,https://youtube.com/watch?v=v3,TRUE,Outdated Title,Outdated Desc
video,https://youtube.com/watch?v=v4,,,
```

**After enrichment:**
- Row 1: 🔒 Locked - preserves your custom content
- Row 2: ⊘ Skipped - already complete, no changes needed
- Row 3: 🔄 Forced refresh - gets latest metadata, resets to FALSE
- Row 4: ⟳ Enriched - automatically filled with metadata

---

## Quick Reference

### When to use `modify=FALSE`
- ✅ You've customized title/description
- ✅ You want to prevent future changes
- ✅ Content is perfect as-is

### When to use `modify=TRUE`
- ✅ Metadata is outdated
- ✅ Source content changed (new thumbnail, updated description)
- ✅ You want to refresh specific rows

### When to leave `modify` empty
- ✅ New content (not yet enriched)
- ✅ Want smart behavior (fill missing fields only)
- ✅ Default/standard workflow

---

## Tips

1. **Protect immediately after customizing**: As soon as you edit a row manually, set `modify=FALSE`

2. **Batch protection**: Use find/replace in your CSV editor to set multiple rows to FALSE at once

3. **Test first**: Try `modify=TRUE` on one row to verify the behavior before batch refreshing

4. **Check the output**: The script shows clear emoji indicators:
   - 🔒 Locked
   - 🔄 Forcing refresh
   - ⟳ Enriching
   - ⊘ Skipping

5. **Auto-reset**: Don't worry about forgetting to reset - `modify=TRUE` automatically becomes `FALSE` after enrichment

---

This gives you complete control over your content while maintaining automation where you need it!
