# Deployment Guide

This guide explains how to deploy the Juanalytics site using Docker.

## Overview

**IMPORTANT: `content.yml` is the single source of truth for all content.**

The deployment process automatically:
1. Reads `content.yml` (the source of truth)
2. Creates markdown files for entries in `content.yml` that don't have them
3. Removes markdown files that are NOT in `content.yml`
4. Builds the Astro site

## Docker Compose Commands

### Development Mode

Run the development server with hot reload:

```bash
docker compose up astro
```

This will:
- Start the Astro dev server on `http://localhost:4321`
- Watch for file changes and hot reload

### Production Build

Build the site for production:

```bash
docker compose run build
```

This will:
1. Run `scripts/sync_content.py` to sync markdown files with `content.yml`
2. Run `npm run build` to build the Astro site

The output will be in the `dist/` directory.

### Full Workflow

To rebuild the Docker image and then build the site:

```bash
# Rebuild the Docker image
docker compose build

# Run the production build
docker compose run build
```

## Manual Scripts

You can also run the scripts manually without Docker:

### Sync Content

Sync markdown files with `content.yml`:

```bash
python3 scripts/sync_content.py
```

This will:
- Create markdown files for entries in `content.yml` that don't have markdown files
- Remove markdown files that are NOT in `content.yml`

**Remember: `content.yml` is the source of truth. The script syncs markdown TO match the YML, not the other way around.**

### Test Content Sync

Check what would be created/removed without making changes:

```bash
python3 scripts/test_content_sync.py
```

### Fix YAML Syntax

Fix common YAML syntax errors in `content.yml`:

```bash
python3 scripts/fix_yaml.py
```

This will create a backup (`content.yml.bak`) before making any changes.

## Content Management

### Adding New Content

**To add new content, edit `content.yml` directly:**

1. Open `content.yml` and add your entry to the appropriate section:
   - `videos:` - YouTube videos and tutorials
   - `sql_lingua_franca:` - SQL Lingua Franca podcast episodes
   - `guest_appearances:` - Guest podcast/webinar appearances
   - `talks:` - Conference talks and presentations
   - `books:` - Published books

2. Required fields for each type:
   - **Videos**: `url`, `title`, `description`, `date`, `tags`
   - **Podcasts**: `url`, `title`, `description`, `date`, `podcast`, `episode`, `tags`
   - **Talks**: `url`, `title`, `description`, `date`, `event`, `location`, `tags`
   - **Books**: `url`, `title`, `description`, `date`, `publisher`, `tags`

3. Run the sync script or build with Docker:
   ```bash
   python3 scripts/sync_content.py
   # or
   docker compose run build
   ```

The markdown file will be automatically created in the correct directory.

### Removing Content

**To remove content, delete it from `content.yml`:**

1. Open `content.yml` and remove the entry

2. Run the sync script or build with Docker:
   ```bash
   python3 scripts/sync_content.py
   # or
   docker compose run build
   ```

The corresponding markdown file will be automatically removed.

### Editing Content

**To edit content, edit `content.yml`:**

1. Open `content.yml` and modify the entry
2. Run the sync script to regenerate markdown files
3. The markdown file will be recreated with the updated content

**Note**: If you manually edit markdown files, those changes will be lost when the sync runs. Always edit `content.yml` instead.

## Troubleshooting

### YAML Syntax Errors

If you encounter YAML syntax errors in `content.yml`:

```bash
python3 scripts/fix_yaml.py
```

This will fix common issues like:
- Trailing spaces in fields
- Unquoted strings with colons
- Multi-line string formatting issues

A backup will be created as `content.yml.bak` before any changes.

### Content Not Appearing

If content isn't appearing on the website:

1. Check that the entry exists in `content.yml` (the source of truth)
2. Verify the entry has the required URL field (`url`)
3. Run the sync script to ensure markdown files are created
4. Rebuild the site

### Docker Build Fails

If the Docker build fails:

1. Check the error message for details
2. Ensure `content.yml` has valid YAML syntax
3. Try fixing YAML errors: `python3 scripts/fix_yaml.py`
4. Try rebuilding from scratch:
   ```bash
   docker compose build --no-cache
   docker compose run build
   ```

### Restoring from Backup

If something goes wrong with `content.yml`, you can restore from backup:

```bash
cp content.yml.bak content.yml
```

## Architecture

The deployment system consists of:

- **`content.yml`** - Single source of truth for all content
- **`scripts/sync_content.py`** - Syncs markdown files to match `content.yml`
- **`scripts/docker-build.sh`** - Docker build entrypoint
- **`scripts/test_content_sync.py`** - Test script to check sync status
- **`scripts/fix_yaml.py`** - YAML syntax error fixer
- **`Dockerfile`** - Docker image with Python and Node.js
- **`docker-compose.yml`** - Docker services: `astro` (dev) and `build` (production)

## Workflow Summary

```
content.yml (edit here)
     ↓
sync_content.py
     ↓
markdown files (auto-generated)
     ↓
Astro build
     ↓
dist/ (static site)
```

**Key Point**: Always edit `content.yml`. Never manually edit markdown files in `src/content/` as they will be overwritten.

## CI/CD Integration

To integrate this with GitHub Actions or other CI/CD:

```yaml
- name: Build site
  run: docker compose run build

- name: Deploy
  run: |
    # Your deployment commands here
    # The built site is in ./dist/
```
