#!/usr/bin/env python3
"""
Content Enrichment Script

This script enriches content.csv with metadata from various sources.
It NEVER modifies the first two columns (type, url) which are manually curated.

Supported URL types:
- YouTube videos: Uses YouTube Data API v3 for metadata
- YouTube playlists/podcasts: Same as videos
- Meetup events: Basic metadata extraction
- Other URLs: Best effort metadata extraction

Usage:
    python scripts/enrich_content.py

Requirements:
    - google-api-python-client (for YouTube)
    - requests (for other URLs)
    - python-dotenv (for environment variables)

Setup:
    1. Create a .env file with: YOUTUBE_API_KEY=your_api_key
    2. Run: pip install google-api-python-client requests python-dotenv
"""

import csv
import os
import re
import sys
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    YOUTUBE_API_AVAILABLE = True
except ImportError:
    YOUTUBE_API_AVAILABLE = False
    print("Warning: google-api-python-client not installed. YouTube metadata will be limited.")

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("Warning: requests not installed. Some URL types won't be enriched.")

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Using environment variables only.")


class ContentEnricher:
    """Enriches content CSV with metadata from various sources."""

    CSV_FILE = './content.csv'
    PROTECTED_COLUMNS = ['type', 'url']  # NEVER modify these
    MODIFY_COLUMN = 'modify'  # Column to control whether to enrich this row

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the content enricher.

        Args:
            api_key: YouTube Data API v3 key (optional, can use env var)
        """
        self.api_key = api_key or os.getenv('YOUTUBE_API_KEY')
        self.youtube = None

        if self.api_key and YOUTUBE_API_AVAILABLE:
            self.youtube = build('youtube', 'v3', developerKey=self.api_key)
        elif not self.api_key:
            print("Warning: YOUTUBE_API_KEY not found. YouTube metadata will be limited.")

    def read_csv(self) -> Tuple[List[str], List[Dict[str, str]]]:
        """
        Read CSV file and return headers and rows.

        Returns:
            Tuple of (headers, rows)
        """
        if not os.path.exists(self.CSV_FILE):
            print(f"Error: {self.CSV_FILE} not found")
            sys.exit(1)

        with open(self.CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            headers = reader.fieldnames
            rows = list(reader)

        return headers, rows

    def write_csv(self, headers: List[str], rows: List[Dict[str, str]]):
        """
        Write CSV file with updated data.

        Args:
            headers: CSV headers
            rows: CSV rows
        """
        with open(self.CSV_FILE, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(rows)

    def extract_youtube_id(self, url: str) -> Optional[str]:
        """
        Extract YouTube video ID from URL.

        Args:
            url: YouTube URL

        Returns:
            Video ID or None
        """
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)',
            r'youtube\.com\/shorts\/([^&\s?]+)'
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        return None

    def is_youtube_url(self, url: str) -> bool:
        """Check if URL is a YouTube URL."""
        return 'youtube.com' in url or 'youtu.be' in url

    def format_duration(self, seconds: int) -> str:
        """
        Format duration in seconds to readable format.

        Args:
            seconds: Duration in seconds

        Returns:
            Formatted duration (HH:MM:SS or MM:SS)
        """
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60

        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{secs:02d}"
        else:
            return f"{minutes:02d}:{secs:02d}"

    def parse_duration(self, duration_iso: str) -> int:
        """
        Parse ISO 8601 duration to seconds.

        Args:
            duration_iso: Duration in ISO 8601 format (e.g., PT1H2M10S)

        Returns:
            Duration in seconds
        """
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration_iso)

        if not match:
            return 0

        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)

        return hours * 3600 + minutes * 60 + seconds

    def enrich_youtube_video(self, url: str, row: Dict[str, str]) -> Dict[str, str]:
        """
        Enrich YouTube video metadata using API.

        Args:
            url: YouTube URL
            row: CSV row dict

        Returns:
            Updated row dict
        """
        video_id = self.extract_youtube_id(url)
        if not video_id:
            print(f"  ✗ Could not extract video ID from {url}")
            return row

        if not self.youtube:
            print(f"  ⚠ YouTube API not available, using fallback for {url}")
            # Fallback: use video ID to construct thumbnail
            if not row.get('thumbnail'):
                row['thumbnail'] = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
            return row

        try:
            # Fetch video details
            response = self.youtube.videos().list(
                part='snippet,contentDetails,statistics',
                id=video_id
            ).execute()

            if not response.get('items'):
                print(f"  ✗ Video not found: {video_id}")
                return row

            video = response['items'][0]
            snippet = video['snippet']
            content_details = video['contentDetails']

            # Only update empty fields (never overwrite existing data)
            if not row.get('title'):
                row['title'] = snippet.get('title', '')

            if not row.get('description'):
                desc = snippet.get('description', '')
                # Truncate to 200 characters
                row['description'] = (desc[:197] + '...') if len(desc) > 200 else desc

            if not row.get('date'):
                published_at = snippet.get('publishedAt', '')
                if published_at:
                    try:
                        pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                        row['date'] = pub_date.strftime('%Y-%m-%d')
                    except:
                        pass

            if not row.get('duration'):
                duration_iso = content_details.get('duration', '')
                if duration_iso:
                    duration_seconds = self.parse_duration(duration_iso)
                    row['duration'] = self.format_duration(duration_seconds)

            if not row.get('thumbnail'):
                thumbnails = snippet.get('thumbnails', {})
                thumbnail_url = (
                    thumbnails.get('maxres', {}).get('url') or
                    thumbnails.get('high', {}).get('url') or
                    thumbnails.get('medium', {}).get('url') or
                    thumbnails.get('default', {}).get('url', '')
                )
                row['thumbnail'] = thumbnail_url

            print(f"  ✓ Enriched: {snippet.get('title', 'Unknown')}")
            return row

        except HttpError as e:
            print(f"  ✗ HTTP error for {video_id}: {e}")
            return row
        except Exception as e:
            print(f"  ✗ Error enriching {video_id}: {e}")
            return row

    def enrich_generic_url(self, url: str, row: Dict[str, str]) -> Dict[str, str]:
        """
        Enrich generic URL metadata using basic HTML parsing.

        Args:
            url: URL to enrich
            row: CSV row dict

        Returns:
            Updated row dict
        """
        if not REQUESTS_AVAILABLE:
            return row

        try:
            # Try to fetch basic metadata from HTML
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            html = response.text

            # Extract title from <title> tag or og:title
            if not row.get('title'):
                title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
                if title_match:
                    row['title'] = title_match.group(1).strip()
                else:
                    og_title_match = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                    if og_title_match:
                        row['title'] = og_title_match.group(1).strip()

            # Extract description from meta tags
            if not row.get('description'):
                desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                if desc_match:
                    row['description'] = desc_match.group(1).strip()
                else:
                    og_desc_match = re.search(r'<meta\s+property=["\']og:description["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                    if og_desc_match:
                        row['description'] = og_desc_match.group(1).strip()

            # Extract thumbnail from og:image
            if not row.get('thumbnail'):
                og_image_match = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                if og_image_match:
                    row['thumbnail'] = og_image_match.group(1).strip()

            print(f"  ✓ Enriched: {row.get('title', 'Unknown')}")
            return row

        except Exception as e:
            print(f"  ✗ Error enriching {url}: {e}")
            return row

    def should_modify_row(self, row: Dict[str, str]) -> bool:
        """
        Check if row should be modified based on the 'modify' column.

        Args:
            row: CSV row dict

        Returns:
            True if row should be enriched, False otherwise
        """
        modify_value = row.get(self.MODIFY_COLUMN, '').strip().upper()

        # If modify column doesn't exist or is empty, check if row is complete
        if not modify_value:
            # Default behavior: only enrich if missing data
            return not all([row.get('title'), row.get('description'), row.get('date'), row.get('thumbnail')])

        # If modify is explicitly set to TRUE, always enrich (overwrite)
        if modify_value in ['TRUE', 'YES', '1', 'T', 'Y']:
            return True

        # If modify is explicitly set to FALSE, never enrich
        if modify_value in ['FALSE', 'NO', '0', 'F', 'N']:
            return False

        # Default to not modifying if value is unclear
        return False

    def enrich_row(self, row: Dict[str, str]) -> Dict[str, str]:
        """
        Enrich a single CSV row with metadata.

        Args:
            row: CSV row dict

        Returns:
            Updated row dict
        """
        url = row.get('url', '').strip()
        content_type = row.get('type', '').strip()

        # Skip empty URLs or rows without type
        if not url or not content_type:
            return row

        # Check if we should modify this row
        should_modify = self.should_modify_row(row)
        modify_value = row.get(self.MODIFY_COLUMN, '').strip().upper()

        if not should_modify:
            if modify_value in ['FALSE', 'NO', '0', 'F', 'N']:
                print(f"  🔒 Locked (modify=FALSE): {row.get('title', url)}")
            else:
                print(f"  ⊘ Skipping (already complete): {row.get('title', url)}")
            return row

        # If modify=TRUE, clear existing fields to force re-enrichment
        if modify_value in ['TRUE', 'YES', '1', 'T', 'Y']:
            print(f"  🔄 Forcing refresh (modify=TRUE): {url}...")
            # Clear fields but preserve type and url
            original_type = row['type']
            original_url = row['url']
            row['title'] = ''
            row['description'] = ''
            row['date'] = ''
            row['duration'] = ''
            row['thumbnail'] = ''
            row['type'] = original_type
            row['url'] = original_url
        else:
            print(f"  ⟳ Enriching [{content_type}] {url}...")

        # Determine URL type and enrich accordingly
        if self.is_youtube_url(url):
            enriched = self.enrich_youtube_video(url, row)
        else:
            enriched = self.enrich_generic_url(url, row)

        # After enrichment, set modify back to FALSE to prevent re-enrichment
        if modify_value in ['TRUE', 'YES', '1', 'T', 'Y']:
            enriched[self.MODIFY_COLUMN] = 'FALSE'

        return enriched

    def enrich_all(self):
        """
        Enrich all rows in the CSV file.
        """
        print("Content Enrichment Script")
        print("=" * 60)
        print(f"Reading {self.CSV_FILE}...")

        headers, rows = self.read_csv()

        if not rows:
            print("No rows found in CSV. Add some content first!")
            return

        print(f"Found {len(rows)} rows to process\n")

        # Enrich each row
        enriched_count = 0
        for i, row in enumerate(rows, 1):
            # Create a copy to avoid modifying protected columns
            original_type = row.get('type', '')
            original_url = row.get('url', '')

            # Enrich the row
            enriched_row = self.enrich_row(row)

            # Ensure protected columns are NEVER modified
            enriched_row['type'] = original_type
            enriched_row['url'] = original_url

            rows[i-1] = enriched_row

            if enriched_row != row:
                enriched_count += 1

        # Write back to CSV
        print(f"\nWriting enriched data to {self.CSV_FILE}...")
        self.write_csv(headers, rows)

        print("=" * 60)
        print(f"✓ Successfully processed {len(rows)} rows")
        print(f"✓ Enriched {enriched_count} rows with new data")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Review the updated content.csv file")
        print("2. Fill in any missing information manually (tags, etc.)")
        print("3. Run: python scripts/generate_markdown.py")
        print("=" * 60)


def main():
    """Main function."""
    enricher = ContentEnricher()
    enricher.enrich_all()


if __name__ == '__main__':
    main()
