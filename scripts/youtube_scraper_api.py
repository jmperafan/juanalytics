"""
YouTube Channel Scraper (API Version)

This is an OPTIONAL alternative scraper that uses the YouTube Data API v3.
Use this if you need:
- ALL videos from your channel (unlimited with pagination!)
- Full descriptions (RSS truncates them)
- Additional metadata (view counts, likes, etc.)

Features:
- Automatically fetches ALL videos through pagination
- Progress tracking for large channels
- Free tier: 10,000 quota units/day (can fetch 100+ videos)

Requirements:
    - google-api-python-client
    - A YouTube Data API key (FREE from Google Cloud Console)

Usage:
    python youtube_scraper_api.py --api-key YOUR_API_KEY --channel-handle @yourhandle

Setup:
    pip install google-api-python-client google-auth google-auth-httplib2
"""

import argparse
import json
from datetime import datetime
from typing import List, Dict, Optional
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class YouTubeScraperAPI:
    """Scraper for YouTube channel data using the official API."""

    def __init__(self, api_key: str):
        """
        Initialize the YouTube scraper.

        Args:
            api_key: YouTube Data API v3 key
        """
        self.api_key = api_key
        self.youtube = build('youtube', 'v3', developerKey=api_key)

    def get_channel_videos(
        self,
        channel_id: Optional[str] = None,
        channel_handle: Optional[str] = None,
        max_results: int = 50
    ) -> List[Dict]:
        """
        Fetch all videos from a YouTube channel.

        Args:
            channel_id: YouTube channel ID (e.g., UCxxxxxx)
            channel_handle: YouTube handle (e.g., @username)
            max_results: Maximum number of videos to fetch per page

        Returns:
            List of video dictionaries with metadata
        """
        try:
            # Get channel's uploads playlist ID
            if channel_handle:
                # Search for channel by handle
                search_response = self.youtube.channels().list(
                    part='contentDetails',
                    forHandle=channel_handle.replace('@', '')
                ).execute()

                if not search_response.get('items'):
                    raise ValueError(f"Channel not found: {channel_handle}")

                uploads_playlist_id = search_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
            elif channel_id:
                channel_response = self.youtube.channels().list(
                    part='contentDetails',
                    id=channel_id
                ).execute()

                if not channel_response.get('items'):
                    raise ValueError(f"Channel not found: {channel_id}")

                uploads_playlist_id = channel_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
            else:
                raise ValueError("Either channel_id or channel_handle must be provided")

            # Fetch all videos from uploads playlist with pagination
            videos = []
            next_page_token = None
            page_count = 0
            shorts_filtered = 0

            print("Fetching videos (this may take a moment for large channels)...")

            while True:
                page_count += 1
                print(f"  Page {page_count}: Fetching up to {max_results} videos...")

                playlist_response = self.youtube.playlistItems().list(
                    part='snippet',
                    playlistId=uploads_playlist_id,
                    maxResults=max_results,
                    pageToken=next_page_token
                ).execute()

                # Get video IDs from this batch to fetch durations
                video_ids = [item['snippet']['resourceId']['videoId'] for item in playlist_response['items']]

                # Fetch video details including duration
                video_details = self._get_video_details(video_ids)

                batch_count = len(playlist_response['items'])
                for item in playlist_response['items']:
                    video_id = item['snippet']['resourceId']['videoId']
                    duration = video_details.get(video_id, {}).get('duration', 0)

                    # Filter out YouTube Shorts (videos under 60 seconds)
                    if duration > 0 and duration < 60:
                        shorts_filtered += 1
                        continue

                    video_data = self._extract_video_data(item, duration)
                    videos.append(video_data)

                print(f"  Page {page_count}: Got {batch_count} videos, filtered {shorts_filtered} Shorts (total so far: {len(videos)})")

                next_page_token = playlist_response.get('nextPageToken')

                if not next_page_token:
                    break

            print(f"\n✓ Successfully fetched {len(videos)} videos from the channel!")
            print(f"✓ Filtered out {shorts_filtered} YouTube Shorts")
            return videos

        except HttpError as e:
            print(f"An HTTP error occurred: {e}")
            raise
        except Exception as e:
            print(f"An error occurred: {e}")
            raise

    def _get_video_details(self, video_ids: List[str]) -> Dict:
        """
        Fetch video details including duration for multiple videos.

        Args:
            video_ids: List of video IDs

        Returns:
            Dictionary mapping video_id to video details
        """
        try:
            # Fetch video details (max 50 per request)
            videos_response = self.youtube.videos().list(
                part='contentDetails',
                id=','.join(video_ids)
            ).execute()

            video_details = {}
            for video in videos_response.get('items', []):
                video_id = video['id']
                duration_iso = video['contentDetails']['duration']

                # Convert ISO 8601 duration to seconds
                duration_seconds = self._parse_duration(duration_iso)
                video_details[video_id] = {'duration': duration_seconds}

            return video_details

        except HttpError as e:
            print(f"Error fetching video details: {e}")
            return {}

    def _parse_duration(self, duration_iso: str) -> int:
        """
        Parse ISO 8601 duration to seconds.

        Args:
            duration_iso: Duration in ISO 8601 format (e.g., PT1H2M10S)

        Returns:
            Duration in seconds
        """
        import re

        # Parse ISO 8601 duration format (PT1H2M10S)
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration_iso)

        if not match:
            return 0

        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)

        return hours * 3600 + minutes * 60 + seconds

    def _extract_video_data(self, item: Dict, duration: int = 0) -> Dict:
        """
        Extract relevant data from a playlist item.

        Args:
            item: Playlist item from YouTube API

        Returns:
            Dictionary with extracted video data
        """
        snippet = item['snippet']

        # Get the best available thumbnail
        thumbnails = snippet.get('thumbnails', {})
        thumbnail_url = (
            thumbnails.get('maxres', {}).get('url') or
            thumbnails.get('high', {}).get('url') or
            thumbnails.get('medium', {}).get('url') or
            thumbnails.get('default', {}).get('url', '')
        )

        # Parse publication date
        published_at = snippet.get('publishedAt', '')
        try:
            pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
            pub_date_str = pub_date.strftime('%Y-%m-%d')
        except:
            pub_date_str = published_at

        return {
            'video_id': snippet.get('resourceId', {}).get('videoId', ''),
            'title': snippet.get('title', ''),
            'description': snippet.get('description', ''),
            'published_date': pub_date_str,
            'thumbnail_url': thumbnail_url,
            'video_url': f"https://www.youtube.com/watch?v={snippet.get('resourceId', {}).get('videoId', '')}",
            'channel_title': snippet.get('channelTitle', ''),
            'duration_seconds': duration,
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
        description='Scrape video data from a YouTube channel using YouTube Data API v3'
    )
    parser.add_argument(
        '--api-key',
        required=True,
        help='YouTube Data API v3 key (get from console.cloud.google.com)'
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
    parser.add_argument(
        '--max-results',
        type=int,
        default=50,
        help='Maximum results per page (default: 50)'
    )

    args = parser.parse_args()

    if not args.channel_id and not args.channel_handle:
        parser.error("Either --channel-id or --channel-handle must be provided")

    # Initialize scraper
    scraper = YouTubeScraperAPI(args.api_key)

    # Fetch videos
    print("Fetching videos from YouTube Data API...")
    videos = scraper.get_channel_videos(
        channel_id=args.channel_id,
        channel_handle=args.channel_handle,
        max_results=args.max_results
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


if __name__ == '__main__':
    main()
