"""
YouTube Channel Scraper

This module scrapes video data from a YouTube channel using YouTube's free RSS feed.
It extracts titles, descriptions, published dates, and thumbnail URLs.
NO API KEY REQUIRED!

Requirements:
    - requests
    - feedparser

Usage:
    python youtube_scraper.py --channel-id YOUR_CHANNEL_ID
"""

import argparse
import json
import re
from datetime import datetime
from typing import List, Dict, Optional
import requests
import feedparser


class YouTubeScraper:
    """Scraper for YouTube channel data using RSS feeds."""

    def __init__(self):
        """Initialize the YouTube scraper."""
        self.rss_base_url = "https://www.youtube.com/feeds/videos.xml"

    def get_channel_id_from_handle(self, handle: str) -> Optional[str]:
        """
        Get channel ID from a YouTube handle by scraping the channel page.

        Args:
            handle: YouTube handle (e.g., @username)

        Returns:
            Channel ID or None if not found
        """
        handle = handle.replace('@', '')
        url = f"https://www.youtube.com/@{handle}"

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            # Look for channel ID in the page source
            match = re.search(r'"channelId":"(UC[a-zA-Z0-9_-]{22})"', response.text)
            if match:
                return match.group(1)

            # Alternative pattern
            match = re.search(r'channel_id=([^&"]+)', response.text)
            if match:
                return match.group(1)

            print(f"Warning: Could not find channel ID for handle @{handle}")
            return None

        except Exception as e:
            print(f"Error fetching channel ID: {e}")
            return None

    def get_channel_videos(
        self,
        channel_id: Optional[str] = None,
        channel_handle: Optional[str] = None
    ) -> List[Dict]:
        """
        Fetch videos from a YouTube channel using RSS feed.
        Note: RSS feeds only return the most recent 15 videos.

        Args:
            channel_id: YouTube channel ID (e.g., UCxxxxxx)
            channel_handle: YouTube handle (e.g., @username)

        Returns:
            List of video dictionaries with metadata
        """
        try:
            # Get channel ID if handle is provided
            if channel_handle and not channel_id:
                print(f"Looking up channel ID for handle: {channel_handle}")
                channel_id = self.get_channel_id_from_handle(channel_handle)
                if not channel_id:
                    raise ValueError(f"Could not find channel ID for handle: {channel_handle}")
                print(f"Found channel ID: {channel_id}")

            if not channel_id:
                raise ValueError("Either channel_id or channel_handle must be provided")

            # Fetch RSS feed
            rss_url = f"{self.rss_base_url}?channel_id={channel_id}"
            print(f"Fetching RSS feed: {rss_url}")

            feed = feedparser.parse(rss_url)

            if not feed.entries:
                print("Warning: No videos found in RSS feed")
                return []

            # Extract video data
            videos = []
            for entry in feed.entries:
                video_data = self._extract_video_data(entry)
                videos.append(video_data)

            print(f"Successfully fetched {len(videos)} videos (RSS feed limit: 15)")
            return videos

        except Exception as e:
            print(f"An error occurred: {e}")
            raise

    def _extract_video_data(self, entry) -> Dict:
        """
        Extract relevant data from an RSS feed entry.

        Args:
            entry: RSS feed entry from feedparser

        Returns:
            Dictionary with extracted video data
        """
        # Extract video ID from link
        video_id = entry.yt_videoid if hasattr(entry, 'yt_videoid') else ''
        if not video_id and hasattr(entry, 'link'):
            match = re.search(r'watch\?v=([a-zA-Z0-9_-]+)', entry.link)
            if match:
                video_id = match.group(1)

        # Get thumbnail URL
        thumbnail_url = ''
        if hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
            thumbnail_url = entry.media_thumbnail[0]['url']
        elif video_id:
            # Default high-quality thumbnail format
            thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"

        # Parse publication date
        published_date = ''
        if hasattr(entry, 'published_parsed'):
            try:
                pub_date = datetime(*entry.published_parsed[:6])
                published_date = pub_date.strftime('%Y-%m-%d')
            except:
                published_date = entry.get('published', '')
        else:
            published_date = entry.get('published', '')

        # Get description (summary in RSS feeds)
        description = entry.get('summary', entry.get('description', ''))

        return {
            'video_id': video_id,
            'title': entry.get('title', ''),
            'description': description,
            'published_date': published_date,
            'thumbnail_url': thumbnail_url,
            'video_url': entry.get('link', f"https://www.youtube.com/watch?v={video_id}"),
            'channel_title': entry.get('author', ''),
            'type': '',  # To be filled manually: 'video' or 'podcast'
            'tags': []  # To be filled manually
        }

    def save_to_json(self, videos: List[Dict], output_file: str):
        """
        Save video data to a JSON file.

        Args:
            videos: List of video dictionaries
            output_file: Path to output JSON file
        """
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(videos, f, indent=2, ensure_ascii=False)

        print(f"Saved {len(videos)} videos to {output_file}")


def main():
    """Main function to run the scraper."""
    parser = argparse.ArgumentParser(
        description='Scrape video data from a YouTube channel using RSS feed (NO API KEY NEEDED!)'
    )
    parser.add_argument(
        '--channel-id',
        help='YouTube channel ID (e.g., UCxxxxxx)'
    )
    parser.add_argument(
        '--channel-handle',
        help='YouTube channel handle (e.g., @username)'
    )
    parser.add_argument(
        '--output',
        default='youtube_data.json',
        help='Output JSON file path (default: youtube_data.json)'
    )

    args = parser.parse_args()

    if not args.channel_id and not args.channel_handle:
        parser.error("Either --channel-id or --channel-handle must be provided")

    # Initialize scraper
    scraper = YouTubeScraper()

    # Fetch videos
    print("Fetching videos from YouTube RSS feed...")
    print("Note: RSS feeds return the most recent 15 videos")
    videos = scraper.get_channel_videos(
        channel_id=args.channel_id,
        channel_handle=args.channel_handle
    )

    # Save to JSON
    scraper.save_to_json(videos, args.output)

    print("\n" + "="*60)
    print("NEXT STEPS:")
    print("="*60)
    print(f"1. Review the generated file: {args.output}")
    print("2. For each video, update the 'type' field to 'video' or 'podcast'")
    print("3. Add relevant tags to the 'tags' array")
    print("4. Run the content generator to create markdown files:")
    print(f"   python scripts/generate_content.py --input {args.output}")
    print("="*60)
    print("\nTIP: RSS feeds only return 15 videos. For more videos,")
    print("     you can get a YouTube Data API key (free tier) from:")
    print("     https://console.cloud.google.com/")


if __name__ == '__main__':
    main()
