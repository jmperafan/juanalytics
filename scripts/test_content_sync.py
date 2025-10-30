#!/usr/bin/env python3
"""
Test script to verify content.yml is in sync with markdown files
and identify any missing or orphaned content
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

def analyze_content_sync():
    """Analyze sync between content.yml and markdown files"""
    print("=" * 80)
    print("CONTENT SYNC ANALYSIS")
    print("=" * 80)
    print()

    # Load YAML content
    with open(YAML_FILE, 'r', encoding='utf-8') as f:
        yaml_data = yaml.safe_load(f)

    # Track URLs in YAML
    # Merge sql_lingua_franca and guest_appearances into podcasts
    all_podcasts = (yaml_data.get('podcasts', []) +
                    yaml_data.get('sql_lingua_franca', []) +
                    yaml_data.get('guest_appearances', []))

    yaml_urls = {
        'videos': set(item['url'] for item in yaml_data.get('videos', [])),
        'podcasts': set(item['url'] for item in all_podcasts),
        'talks': set(item['url'] for item in yaml_data.get('talks', [])),
        'books': set(item['url'] for item in yaml_data.get('books', [])),
    }

    # Track markdown files
    md_files = {
        'videos': {},
        'podcasts': {},
        'talks': {},
        'books': {},
    }

    # Scan markdown files
    for content_type in ['videos', 'podcasts', 'talks', 'books']:
        content_path = CONTENT_DIR / content_type
        if not content_path.exists():
            continue

        for md_file in content_path.glob('*.md'):
            content = md_file.read_text(encoding='utf-8')
            fm = extract_frontmatter(content)
            url = get_url_from_frontmatter(fm, content_type)
            title = fm.get('title', md_file.stem)

            if url:
                md_files[content_type][url] = {
                    'file': md_file.name,
                    'title': title
                }

    # Analysis results
    results = {
        'in_sync': {},
        'in_yml_not_md': {},
        'in_md_not_yml': {},
        'totals': {}
    }

    print("CONTENT TYPE ANALYSIS")
    print("=" * 80)
    print()

    for content_type in ['videos', 'podcasts', 'talks', 'books']:
        yaml_set = yaml_urls[content_type]
        md_set = set(md_files[content_type].keys())

        in_sync = yaml_set & md_set
        in_yml_not_md = yaml_set - md_set
        in_md_not_yml = md_set - yaml_set

        results['in_sync'][content_type] = len(in_sync)
        results['in_yml_not_md'][content_type] = len(in_yml_not_md)
        results['in_md_not_yml'][content_type] = len(in_md_not_yml)
        results['totals'][content_type] = {
            'yml': len(yaml_set),
            'md': len(md_set)
        }

        print(f"📁 {content_type.upper()}")
        print(f"  In content.yml: {len(yaml_set)}")
        print(f"  Markdown files: {len(md_set)}")
        print(f"  ✓ In sync: {len(in_sync)}")
        print(f"  ⚠ In YAML but no MD file: {len(in_yml_not_md)}")
        print(f"  ⚠ In MD but not in YAML: {len(in_md_not_yml)}")

        if in_md_not_yml:
            print(f"\n  ⚠️  WARNING: {len(in_md_not_yml)} markdown files will NOT appear on website!")
            print("  These files exist but are not in content.yml:")
            for url in sorted(in_md_not_yml)[:10]:  # Show first 10
                info = md_files[content_type][url]
                print(f"    - {info['file']}: {info['title'][:60]}")
            if len(in_md_not_yml) > 10:
                print(f"    ... and {len(in_md_not_yml) - 10} more")
        print()

    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print()

    total_yml = sum(results['totals'][t]['yml'] for t in results['totals'])
    total_md = sum(results['totals'][t]['md'] for t in results['totals'])
    total_in_sync = sum(results['in_sync'].values())
    total_orphaned = sum(results['in_md_not_yml'].values())
    total_missing_md = sum(results['in_yml_not_md'].values())

    print(f"Total items in content.yml: {total_yml}")
    print(f"Total markdown files: {total_md}")
    print(f"✓ In sync: {total_in_sync}")
    print(f"⚠ Markdown files NOT in content.yml (WILL NOT APPEAR ON SITE): {total_orphaned}")
    print(f"⚠ YAML entries without markdown files: {total_missing_md}")
    print()

    # Verdict
    if total_orphaned > 0:
        print("❌ WARNING: Content is NOT in sync!")
        print(f"   {total_orphaned} markdown files will not appear on the website.")
        print()
        print("RECOMMENDATION:")
        print("1. Review the orphaned markdown files listed above")
        print("2. Either:")
        print("   a) Add them to content.yml (run: python3 scripts/add_missing_to_yml.py)")
        print("   b) Delete them if they're no longer needed")
        print()
    else:
        print("✅ All content is in sync!")
        print()

    # Check blog (uses Astro getCollection, not content.yml)
    blog_path = CONTENT_DIR / 'blog'
    if blog_path.exists():
        blog_count = len(list(blog_path.glob('*.md')))
        print("=" * 80)
        print("NOTE: Blog posts")
        print("=" * 80)
        print()
        print(f"Blog posts: {blog_count}")
        print("Blog posts use Astro's getCollection() and are NOT in content.yml")
        print("This is normal and expected.")
        print()

    return results

if __name__ == '__main__':
    analyze_content_sync()
