"""
Content Generator for Juanalytics Site

This script converts YouTube video data (from youtube_scraper.py output)
into markdown files that can be used with the Astro site.

Usage:
    python generate_content.py --input youtube_data.json
"""

import argparse
import json
import os
import re
from typing import Dict, List
from pathlib import Path


class ContentGenerator:
    """Generate markdown content files from YouTube data."""

    def __init__(self, content_dir: str = '../src/content'):
        """
        Initialize the content generator.

        Args:
            content_dir: Path to the content directory
        """
        self.content_dir = Path(content_dir)
        self.videos_dir = self.content_dir / 'videos'
        self.podcasts_dir = self.content_dir / 'podcasts'

        # Create directories if they don't exist
        self.videos_dir.mkdir(parents=True, exist_ok=True)
        self.podcasts_dir.mkdir(parents=True, exist_ok=True)

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
        # Replace spaces and special characters with hyphens
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        # Remove leading/trailing hyphens
        text = text.strip('-')
        return text

    def generate_video_markdown(self, video: Dict) -> str:
        """
        Generate markdown content for a video.

        Args:
            video: Video data dictionary

        Returns:
            Markdown content string
        """
        tags_str = ', '.join([f"'{tag}'" for tag in video.get('tags', [])])

        markdown = f"""---
title: '{video['title'].replace("'", "''")}'
description: '{video['description'][:200].replace("'", "''").replace(chr(10), ' ')}...'
pubDate: {video['published_date']}
videoUrl: '{video['video_url']}'
platform: 'youtube'
tags: [{tags_str}]
---

# {video['title']}

{video['description']}

## Watch the Video

[Watch on YouTube]({video['video_url']})

## Resources

- [My YouTube Channel](https://www.youtube.com/juanalytics)
- [Fundamentals of Analytics Engineering Book](https://www.amazon.com/author/jmperafan)

---

**Thumbnail**: {video['thumbnail_url']}
"""
        return markdown

    def generate_podcast_markdown(self, video: Dict, episode_num: int) -> str:
        """
        Generate markdown content for a podcast episode.

        Args:
            video: Video data dictionary
            episode_num: Episode number

        Returns:
            Markdown content string
        """
        tags_str = ', '.join([f"'{tag}'" for tag in video.get('tags', [])])

        markdown = f"""---
title: 'Episode {episode_num} - {video['title'].replace("'", "''")}'
description: '{video['description'][:200].replace("'", "''").replace(chr(10), ' ')}...'
pubDate: {video['published_date']}
podcastName: 'Juanalytics Podcast'
episode: {episode_num}
duration: '00:00'
type: 'own'
tags: [{tags_str}]
videoUrl: '{video['video_url']}'
---

# Episode {episode_num} - {video['title']}

{video['description']}

## Listen

[Watch/Listen on YouTube]({video['video_url']})

## Topics Covered

- Add specific topics here after reviewing the episode

## Links

- [YouTube Channel](https://www.youtube.com/juanalytics)

---

**Thumbnail**: {video['thumbnail_url']}
"""
        return markdown

    def process_videos(self, videos: List[Dict], overwrite: bool = False):
        """
        Process videos and generate markdown files.

        Args:
            videos: List of video dictionaries
            overwrite: Whether to overwrite existing files
        """
        podcast_counter = 1
        videos_created = 0
        podcasts_created = 0
        skipped = 0

        for video in videos:
            # Skip if type is not set
            if not video.get('type'):
                print(f"⚠️  Skipping '{video['title']}' - type not set (video/podcast)")
                skipped += 1
                continue

            # Generate slug for filename
            slug = self.slugify(video['title'])

            if video['type'] == 'podcast':
                # Generate podcast markdown
                output_file = self.podcasts_dir / f"episode-{podcast_counter:02d}-{slug}.md"
                markdown_content = self.generate_podcast_markdown(video, podcast_counter)
                podcast_counter += 1
                podcasts_created += 1

            elif video['type'] == 'video':
                # Generate video markdown
                output_file = self.videos_dir / f"{slug}.md"
                markdown_content = self.generate_video_markdown(video)
                videos_created += 1

            else:
                print(f"⚠️  Skipping '{video['title']}' - invalid type: {video['type']}")
                skipped += 1
                continue

            # Check if file exists
            if output_file.exists() and not overwrite:
                print(f"⏭️  Skipping existing file: {output_file.name}")
                continue

            # Write markdown file
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(markdown_content)

            print(f"✅ Created: {output_file.name}")

        # Print summary
        print("\n" + "="*60)
        print("SUMMARY:")
        print("="*60)
        print(f"Videos created:   {videos_created}")
        print(f"Podcasts created: {podcasts_created}")
        print(f"Skipped:          {skipped}")
        print("="*60)


def main():
    """Main function to generate content."""
    parser = argparse.ArgumentParser(
        description='Generate markdown content from YouTube data'
    )
    parser.add_argument(
        '--input',
        required=True,
        help='Input JSON file with YouTube data'
    )
    parser.add_argument(
        '--content-dir',
        default='../src/content',
        help='Path to content directory (default: ../src/content)'
    )
    parser.add_argument(
        '--overwrite',
        action='store_true',
        help='Overwrite existing markdown files'
    )

    args = parser.parse_args()

    # Check if input file exists
    if not os.path.exists(args.input):
        print(f"Error: Input file not found: {args.input}")
        return

    # Load video data
    with open(args.input, 'r', encoding='utf-8') as f:
        videos = json.load(f)

    print(f"Loaded {len(videos)} videos from {args.input}")

    # Generate content
    generator = ContentGenerator(args.content_dir)
    generator.process_videos(videos, overwrite=args.overwrite)

    print("\n" + "="*60)
    print("DONE!")
    print("="*60)
    print("Your content files have been generated.")
    print("Review them and update as needed before publishing.")
    print("="*60)


if __name__ == '__main__':
    main()
