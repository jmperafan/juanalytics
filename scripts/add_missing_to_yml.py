#!/usr/bin/env python3
"""
Add missing markdown files to content.yml
"""

import yaml
from pathlib import Path
import re

PROJECT_ROOT = Path(__file__).parent.parent
CONTENT_DIR = PROJECT_ROOT / 'src' / 'content'
YAML_FILE = PROJECT_ROOT / 'content.yml'

def extract_frontmatter(content):
    """Extract YAML frontmatter from markdown content"""
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}

    try:
        return yaml.safe_load(match.group(1))
    except:
        return {}

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

def convert_md_to_yaml_item(fm, content_type):
    """Convert markdown frontmatter to YAML item"""
    item = {}

    # Get URL
    url = get_url_from_frontmatter(fm, content_type)
    if not url:
        return None

    item['url'] = url
    item['title'] = fm.get('title', '')
    item['description'] = fm.get('description', '')
    item['date'] = fm.get('date') or fm.get('pubDate', '')

    # Optional fields
    if fm.get('duration'):
        item['duration'] = fm['duration']
    if fm.get('thumbnail') or fm.get('coverImage'):
        item['thumbnail'] = fm.get('thumbnail') or fm.get('coverImage')

    # Tags
    tags = fm.get('tags', [])
    if isinstance(tags, list):
        item['tags'] = tags
    else:
        item['tags'] = []

    # Type-specific fields
    if content_type == 'videos':
        if fm.get('platform'):
            item['platform'] = fm['platform']
    elif content_type == 'podcasts':
        if fm.get('episode'):
            item['episode'] = fm['episode']
        if fm.get('podcastName'):
            item['podcastName'] = fm['podcastName']
    elif content_type == 'talks':
        if fm.get('event'):
            item['event'] = fm['event']
        if fm.get('location'):
            item['location'] = fm['location']
    elif content_type == 'books':
        if fm.get('publisher'):
            item['publisher'] = fm['publisher']
        if fm.get('coAuthors'):
            item['coAuthors'] = fm['coAuthors']

    return item

def add_missing_to_yml():
    """Add missing markdown files to content.yml"""
    print("=" * 80)
    print("ADDING MISSING CONTENT TO content.yml")
    print("=" * 80)
    print()

    # Load existing YAML
    with open(YAML_FILE, 'r', encoding='utf-8') as f:
        yaml_data = yaml.safe_load(f)

    # Track existing URLs
    # Merge sql_lingua_franca and guest_appearances into podcasts
    all_podcasts = (yaml_data.get('podcasts', []) +
                    yaml_data.get('sql_lingua_franca', []) +
                    yaml_data.get('guest_appearances', []))

    existing_urls = {
        'videos': set(item['url'] for item in yaml_data.get('videos', [])),
        'podcasts': set(item['url'] for item in all_podcasts),
        'talks': set(item['url'] for item in yaml_data.get('talks', [])),
        'books': set(item['url'] for item in yaml_data.get('books', [])),
    }

    added_count = 0

    # Process each content type
    for content_type in ['videos', 'podcasts', 'talks', 'books']:
        content_path = CONTENT_DIR / content_type
        if not content_path.exists():
            continue

        for md_file in content_path.glob('*.md'):
            content = md_file.read_text(encoding='utf-8')
            fm = extract_frontmatter(content)
            url = get_url_from_frontmatter(fm, content_type)

            if not url:
                print(f"⊘ Skipping {md_file.name} - no URL found")
                continue

            if url in existing_urls[content_type]:
                # Already in YAML
                continue

            # Convert to YAML item
            item = convert_md_to_yaml_item(fm, content_type)
            if not item:
                print(f"⊘ Skipping {md_file.name} - could not convert")
                continue

            # Add to YAML data
            # For podcasts, add to guest_appearances by default
            yaml_key = 'guest_appearances' if content_type == 'podcasts' else content_type

            if yaml_key not in yaml_data:
                yaml_data[yaml_key] = []

            yaml_data[yaml_key].append(item)
            added_count += 1

            section_label = 'guest_appearances' if content_type == 'podcasts' else content_type
            print(f"✓ Added {section_label}/{md_file.name}: {item['title'][:60]}")

    if added_count == 0:
        print("No missing items found. All markdown files are already in content.yml!")
        return

    # Sort by date (most recent first)
    for content_type in yaml_data:
        yaml_data[content_type].sort(key=lambda x: str(x.get('date', '')), reverse=True)

    # Write updated YAML
    with open(YAML_FILE, 'w', encoding='utf-8') as f:
        yaml.dump(yaml_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

    print()
    print("=" * 80)
    print(f"✓ Added {added_count} items to content.yml")
    print(f"✓ Updated {YAML_FILE}")
    print()
    print("Next steps:")
    print("  1. Run: python3 scripts/test_content_sync.py")
    print("  2. Verify the website: npm run dev")
    print("=" * 80)

if __name__ == '__main__':
    add_missing_to_yml()
