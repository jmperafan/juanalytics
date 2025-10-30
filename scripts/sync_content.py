#!/usr/bin/env python3
"""
Sync markdown files with content.yml (content.yml is the source of truth)
- Creates markdown files for entries in content.yml that don't have them
- Removes markdown files that are not in content.yml
"""

import yaml
from pathlib import Path
import re
import sys

PROJECT_ROOT = Path(__file__).parent.parent
CONTENT_DIR = PROJECT_ROOT / 'src' / 'content'
YAML_FILE = PROJECT_ROOT / 'content.yml'

def slugify(text):
    """Convert text to a URL-friendly slug"""
    # Remove special characters and convert to lowercase
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def get_markdown_filename(item, content_type):
    """Generate a markdown filename from an item"""
    title = item.get('title', '')
    url = item.get('url', '')

    # Create slug from title
    slug = slugify(title)

    # Limit length to avoid filesystem issues
    if len(slug) > 80:
        slug = slug[:80]

    # Ensure uniqueness by adding hash of URL if needed
    filename = f"{slug}.md"

    return filename

def create_markdown_frontmatter(item, content_type):
    """Create markdown frontmatter from YAML item"""
    frontmatter = {}

    # Map common fields
    frontmatter['title'] = item.get('title', '')
    frontmatter['description'] = item.get('description', '')
    frontmatter['date'] = item.get('date', '')
    frontmatter['tags'] = item.get('tags', [])

    # Add type-specific URL field
    if content_type == 'videos':
        frontmatter['videoUrl'] = item.get('url', '')
        if item.get('platform'):
            frontmatter['platform'] = item['platform']
        if item.get('duration'):
            frontmatter['duration'] = item['duration']
        if item.get('thumbnail'):
            frontmatter['thumbnail'] = item['thumbnail']
    elif content_type == 'podcasts':
        frontmatter['audioUrl'] = item.get('url', '')
        if item.get('podcast'):
            frontmatter['podcast'] = item['podcast']
        if item.get('episode'):
            frontmatter['episode'] = item['episode']
        if item.get('duration'):
            frontmatter['duration'] = item['duration']
        if item.get('thumbnail'):
            frontmatter['thumbnail'] = item['thumbnail']
    elif content_type == 'talks':
        frontmatter['eventUrl'] = item.get('url', '')
        if item.get('event'):
            frontmatter['event'] = item['event']
        if item.get('location'):
            frontmatter['location'] = item['location']
        if item.get('duration'):
            frontmatter['duration'] = item['duration']
        if item.get('thumbnail'):
            frontmatter['thumbnail'] = item['thumbnail']
    elif content_type == 'books':
        frontmatter['amazonUrl'] = item.get('url', '')
        if item.get('publisher'):
            frontmatter['publisher'] = item['publisher']
        if item.get('coAuthors'):
            frontmatter['coAuthors'] = item['coAuthors']
        if item.get('thumbnail'):
            frontmatter['coverImage'] = item['thumbnail']

    return frontmatter

def get_url_from_frontmatter(fm, content_type):
    """Extract the primary URL from frontmatter"""
    if content_type == 'videos':
        return fm.get('videoUrl', '')
    elif content_type == 'podcasts':
        return fm.get('audioUrl', '')
    elif content_type == 'talks':
        return fm.get('eventUrl', '')
    elif content_type == 'books':
        return fm.get('amazonUrl', '')
    return ''

def extract_frontmatter(content):
    """Extract YAML frontmatter from markdown content"""
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}

    try:
        return yaml.safe_load(match.group(1))
    except:
        return {}

def create_markdown_file(item, content_type, file_path):
    """Create a markdown file from a YAML item"""
    frontmatter = create_markdown_frontmatter(item, content_type)

    # Convert frontmatter to YAML
    yaml_str = yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True, sort_keys=False)

    # Create markdown content
    content = f"---\n{yaml_str}---\n\n"

    # Add description as content if it exists
    if item.get('description'):
        content += f"{item['description']}\n"

    # Write file
    file_path.write_text(content, encoding='utf-8')

def sync_content():
    """Sync markdown files with content.yml (yml is source of truth)"""
    print("=" * 80)
    print("SYNCING CONTENT (content.yml → markdown files)")
    print("=" * 80)
    print()

    # Load YAML content
    with open(YAML_FILE, 'r', encoding='utf-8') as f:
        yaml_data = yaml.safe_load(f) or {}

    # Track changes
    created_count = 0
    removed_count = 0

    # Map YAML sections to content types
    section_mapping = {
        'videos': 'videos',
        'sql_lingua_franca': 'podcasts',
        'guest_appearances': 'podcasts',
        'talks': 'talks',
        'books': 'books',
    }

    # Collect all URLs from YAML
    yaml_urls_by_type = {
        'videos': set(),
        'podcasts': set(),
        'talks': set(),
        'books': set(),
    }

    for section, content_type in section_mapping.items():
        items = yaml_data.get(section, [])
        for item in items:
            url = item.get('url')
            if url:
                yaml_urls_by_type[content_type].add(url)

    print("STEP 1: Creating missing markdown files")
    print("-" * 80)

    # Create missing markdown files
    for section, content_type in section_mapping.items():
        items = yaml_data.get(section, [])
        content_path = CONTENT_DIR / content_type
        content_path.mkdir(parents=True, exist_ok=True)

        # Build map of existing markdown files by URL
        existing_md_files = {}
        for md_file in content_path.glob('*.md'):
            content = md_file.read_text(encoding='utf-8')
            fm = extract_frontmatter(content)
            url = get_url_from_frontmatter(fm, content_type)
            if url:
                existing_md_files[url] = md_file

        # Create files for items without markdown
        for item in items:
            url = item.get('url')
            if not url:
                continue

            if url in existing_md_files:
                # File already exists
                continue

            # Create new markdown file
            filename = get_markdown_filename(item, content_type)
            file_path = content_path / filename

            # Handle duplicate filenames
            counter = 1
            while file_path.exists():
                name_without_ext = file_path.stem
                file_path = content_path / f"{name_without_ext}-{counter}.md"
                counter += 1

            create_markdown_file(item, content_type, file_path)
            created_count += 1
            print(f"  ✓ Created {content_type}/{file_path.name}")

    print()
    print("STEP 2: Removing markdown files not in content.yml")
    print("-" * 80)

    # Remove markdown files not in YAML
    for content_type in ['videos', 'podcasts', 'talks', 'books']:
        content_path = CONTENT_DIR / content_type
        if not content_path.exists():
            continue

        yaml_urls = yaml_urls_by_type[content_type]

        for md_file in content_path.glob('*.md'):
            content = md_file.read_text(encoding='utf-8')
            fm = extract_frontmatter(content)
            url = get_url_from_frontmatter(fm, content_type)

            if url and url not in yaml_urls:
                # File not in YAML, remove it
                md_file.unlink()
                removed_count += 1
                print(f"  ✗ Removed {content_type}/{md_file.name}")
            elif not url:
                print(f"  ⊘ Warning: {content_type}/{md_file.name} has no URL, keeping it")

    print()

    if created_count == 0 and removed_count == 0:
        print("✓ Content is already in sync!")
        return True

    print("=" * 80)
    print("SYNC COMPLETE")
    print("=" * 80)
    print(f"  Created: {created_count} markdown files")
    print(f"  Removed: {removed_count} markdown files")
    print("=" * 80)
    print()

    return True

if __name__ == '__main__':
    try:
        success = sync_content()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
