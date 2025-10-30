#!/usr/bin/env python3
"""
Generate Markdown Files from CSV

This script reads the enriched content.csv and generates markdown files
for each content item in the appropriate directory (videos, podcasts, talks, books).

Usage:
    python scripts/generate_markdown.py

The script will:
1. Read content.csv
2. Generate markdown files in src/content/{type}/
3. Skip existing files (won't overwrite)
4. Create slugified filenames from titles
"""

import csv
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List


class MarkdownGenerator:
    """Generates markdown files from CSV content."""

    CSV_FILE = './content.csv'
    CONTENT_DIR = './src/content'

    # Mapping of CSV type to content directory
    TYPE_TO_DIR = {
        'video': 'videos',
        'podcast': 'podcasts',
        'talk': 'talks',
        'book': 'books'
    }

    def __init__(self):
        """Initialize the markdown generator."""
        self.ensure_directories()

    def ensure_directories(self):
        """Ensure all content directories exist."""
        for dir_name in self.TYPE_TO_DIR.values():
            dir_path = Path(self.CONTENT_DIR) / dir_name
            dir_path.mkdir(parents=True, exist_ok=True)

    def slugify(self, text: str) -> str:
        """
        Convert text to a URL-friendly slug.

        Args:
            text: Text to slugify

        Returns:
            Slugified text
        """
        # Convert to lowercase
        text = text.lower()

        # Remove special characters
        text = re.sub(r'[^\w\s-]', '', text)

        # Replace spaces with hyphens
        text = re.sub(r'[-\s]+', '-', text)

        # Remove leading/trailing hyphens
        text = text.strip('-')

        return text

    def read_csv(self) -> List[Dict[str, str]]:
        """
        Read CSV file and return rows.

        Returns:
            List of CSV rows as dicts
        """
        if not os.path.exists(self.CSV_FILE):
            print(f"Error: {self.CSV_FILE} not found")
            sys.exit(1)

        with open(self.CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = [row for row in reader if row.get('type') and row.get('url')]

        return rows

    def generate_video_markdown(self, row: Dict[str, str]) -> str:
        """
        Generate markdown content for a video.

        Args:
            row: CSV row dict

        Returns:
            Markdown content
        """
        tags = row.get('tags', '').split(';') if row.get('tags') else []
        tags_str = ', '.join([f"'{tag.strip()}'" for tag in tags if tag.strip()])

        title = row.get('title', '').replace("'", "\\'")
        description = row.get('description', '').replace("'", "\\'")
        date = row.get('date', datetime.now().strftime('%Y-%m-%d'))
        url = row.get('url', '')
        thumbnail = row.get('thumbnail', '')
        platform = row.get('extra1', 'youtube')
        duration = row.get('duration', '')

        return f"""---
title: '{title}'
description: '{description}'
pubDate: {date}
videoUrl: '{url}'
thumbnail: '{thumbnail}'
platform: '{platform}'
tags: [{tags_str}]
duration: '{duration}'
---

# {row.get('title', 'Untitled')}

{row.get('description', '')}

Watch the full video on [YouTube]({url}).
"""

    def generate_podcast_markdown(self, row: Dict[str, str]) -> str:
        """
        Generate markdown content for a podcast.

        Args:
            row: CSV row dict

        Returns:
            Markdown content
        """
        tags = row.get('tags', '').split(';') if row.get('tags') else []
        tags_str = ', '.join([f"'{tag.strip()}'" for tag in tags if tag.strip()])

        title = row.get('title', '').replace("'", "\\'")
        description = row.get('description', '').replace("'", "\\'")
        date = row.get('date', datetime.now().strftime('%Y-%m-%d'))
        url = row.get('url', '')
        thumbnail = row.get('thumbnail', '')
        duration = row.get('duration', '')
        episode = row.get('extra1', '')
        podcast_name = row.get('extra2', 'Podcast')

        return f"""---
title: '{title}'
description: '{description}'
pubDate: {date}
audioUrl: '{url}'
thumbnail: '{thumbnail}'
tags: [{tags_str}]
duration: '{duration}'
episode: '{episode}'
podcastName: '{row.get('extra2', '')}'
---

# {row.get('title', 'Untitled')}

{row.get('description', '')}

Listen to the full episode at [{podcast_name}]({url}).
"""

    def generate_talk_markdown(self, row: Dict[str, str]) -> str:
        """
        Generate markdown content for a talk.

        Args:
            row: CSV row dict

        Returns:
            Markdown content
        """
        tags = row.get('tags', '').split(';') if row.get('tags') else []
        tags_str = ', '.join([f"'{tag.strip()}'" for tag in tags if tag.strip()])

        title = row.get('title', '').replace("'", "\\'")
        description = row.get('description', '').replace("'", "\\'")
        date = row.get('date', datetime.now().strftime('%Y-%m-%d'))
        url = row.get('url', '')
        thumbnail = row.get('thumbnail', '')
        event = row.get('extra1', 'Event')
        location = row.get('extra2', '')

        return f"""---
title: '{title}'
description: '{description}'
date: {date}
eventUrl: '{url}'
coverImage: '{thumbnail}'
tags: [{tags_str}]
event: '{row.get('extra1', '')}'
location: '{location}'
---

# {row.get('title', 'Untitled')}

{row.get('description', '')}

Learn more about this talk at [{event}]({url}).
"""

    def generate_book_markdown(self, row: Dict[str, str]) -> str:
        """
        Generate markdown content for a book.

        Args:
            row: CSV row dict

        Returns:
            Markdown content
        """
        tags = row.get('tags', '').split(';') if row.get('tags') else []
        tags_str = ', '.join([f"'{tag.strip()}'" for tag in tags if tag.strip()])

        title = row.get('title', '').replace("'", "\\'")
        description = row.get('description', '').replace("'", "\\'")
        date = row.get('date', datetime.now().strftime('%Y-%m-%d'))
        url = row.get('url', '')
        thumbnail = row.get('thumbnail', '')
        publisher = row.get('extra1', '')

        return f"""---
title: '{title}'
description: '{description}'
pubDate: {date}
amazonUrl: '{url}'
coverImage: '{thumbnail}'
tags: [{tags_str}]
publisher: '{publisher}'
coAuthors: []
---

# {row.get('title', 'Untitled')}

{row.get('description', '')}

Get the book on [Amazon]({url}).
"""

    def generate_markdown(self, row: Dict[str, str]) -> str:
        """
        Generate markdown content for a row based on its type.

        Args:
            row: CSV row dict

        Returns:
            Markdown content
        """
        content_type = row.get('type', '').lower()

        if content_type == 'video':
            return self.generate_video_markdown(row)
        elif content_type == 'podcast':
            return self.generate_podcast_markdown(row)
        elif content_type == 'talk':
            return self.generate_talk_markdown(row)
        elif content_type == 'book':
            return self.generate_book_markdown(row)
        else:
            print(f"  ⚠ Unknown content type: {content_type}")
            return ""

    def get_filename(self, row: Dict[str, str]) -> str:
        """
        Generate a filename for the markdown file.

        Args:
            row: CSV row dict

        Returns:
            Filename (without extension)
        """
        title = row.get('title', '')
        if not title:
            # Use URL as fallback
            url = row.get('url', '')
            if url:
                title = url.split('/')[-1]
            else:
                title = f"untitled-{datetime.now().timestamp()}"

        slug = self.slugify(title)

        # Limit filename length
        if len(slug) > 100:
            slug = slug[:100]

        return slug

    def file_exists(self, content_type: str, filename: str) -> bool:
        """
        Check if markdown file already exists.

        Args:
            content_type: Content type (video, podcast, talk, book)
            filename: Filename without extension

        Returns:
            True if file exists
        """
        dir_name = self.TYPE_TO_DIR.get(content_type)
        if not dir_name:
            return False

        file_path = Path(self.CONTENT_DIR) / dir_name / f"{filename}.md"
        return file_path.exists()

    def write_markdown(self, content_type: str, filename: str, content: str):
        """
        Write markdown content to file.

        Args:
            content_type: Content type (video, podcast, talk, book)
            filename: Filename without extension
            content: Markdown content
        """
        dir_name = self.TYPE_TO_DIR.get(content_type)
        if not dir_name:
            print(f"  ✗ Invalid content type: {content_type}")
            return

        file_path = Path(self.CONTENT_DIR) / dir_name / f"{filename}.md"

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  ✓ Created: {file_path}")

    def generate_all(self, force: bool = False):
        """
        Generate all markdown files from CSV.

        Args:
            force: If True, overwrite existing files
        """
        print("Markdown Generation Script")
        print("=" * 60)
        print(f"Reading {self.CSV_FILE}...")

        rows = self.read_csv()

        if not rows:
            print("No valid rows found in CSV.")
            return

        print(f"Found {len(rows)} content items\n")

        # Generate markdown for each row
        created_count = 0
        skipped_count = 0

        for row in rows:
            content_type = row.get('type', '').lower()
            title = row.get('title', 'Untitled')

            if not content_type or content_type not in self.TYPE_TO_DIR:
                print(f"  ⚠ Skipping (invalid type): {title}")
                skipped_count += 1
                continue

            filename = self.get_filename(row)

            # Check if file already exists
            if not force and self.file_exists(content_type, filename):
                print(f"  ⊘ Skipping (already exists): {title}")
                skipped_count += 1
                continue

            # Generate and write markdown
            markdown_content = self.generate_markdown(row)
            if markdown_content:
                self.write_markdown(content_type, filename, markdown_content)
                created_count += 1

        print("\n" + "=" * 60)
        print(f"✓ Created {created_count} new markdown files")
        print(f"⊘ Skipped {skipped_count} existing files")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Review the generated files in src/content/")
        print("2. Edit any files that need manual adjustments")
        print("3. Run: npm run dev")
        print("=" * 60)


def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Generate markdown files from content.csv'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Overwrite existing markdown files'
    )

    args = parser.parse_args()

    generator = MarkdownGenerator()
    generator.generate_all(force=args.force)


if __name__ == '__main__':
    main()
