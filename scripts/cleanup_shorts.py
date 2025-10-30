"""
Cleanup Script for Removing YouTube Shorts

This script:
1. Fetches duration data for all existing videos
2. Removes videos under 60 seconds (Shorts)
3. Re-classifies videos based on updated rules

Usage:
    python cleanup_shorts.py --api-key YOUR_API_KEY --input classified_videos.json --output cleaned_videos.json
"""

import argparse
import json
import sys
from typing import List, Dict
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class VideoCleanup:
    """Clean up existing video data by removing shorts."""

    def __init__(self, api_key: str):
        """Initialize with YouTube API key."""
        self.api_key = api_key
        self.youtube = build('youtube', 'v3', developerKey=api_key)

    def parse_duration(self, duration_iso: str) -> int:
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

    def fetch_video_durations(self, video_ids: List[str]) -> Dict[str, int]:
        """
        Fetch durations for a list of video IDs.

        Args:
            video_ids: List of video IDs

        Returns:
            Dictionary mapping video_id to duration in seconds
        """
        durations = {}

        # Process in batches of 50 (API limit)
        batch_size = 50
        for i in range(0, len(video_ids), batch_size):
            batch = video_ids[i:i + batch_size]

            try:
                videos_response = self.youtube.videos().list(
                    part='contentDetails',
                    id=','.join(batch)
                ).execute()

                for video in videos_response.get('items', []):
                    video_id = video['id']
                    duration_iso = video['contentDetails']['duration']
                    duration_seconds = self.parse_duration(duration_iso)
                    durations[video_id] = duration_seconds

                print(f"  Fetched durations for {len(batch)} videos...")

            except HttpError as e:
                print(f"Error fetching batch: {e}")
                continue

        return durations

    def classify_video(self, video: Dict, config: Dict) -> Dict:
        """
        Re-classify a video based on updated rules.

        Args:
            video: Video dictionary
            config: Configuration with classification rules

        Returns:
            Updated video dictionary
        """
        title_lower = video['title'].lower()
        description_lower = video.get('description', '').lower()
        combined_text = f"{title_lower} {description_lower}"

        rules = config.get('auto_classification', {}).get('rules', {})
        podcast_keywords = rules.get('podcast', {}).get('keywords', [])

        # Check if it matches podcast keywords
        if any(keyword in combined_text for keyword in podcast_keywords):
            video['type'] = 'podcast'
            video['tags'] = rules.get('podcast', {}).get('tags', ['podcast'])
        else:
            # Keep existing classification if it was already set
            if not video.get('type'):
                video['type'] = 'video'
                video['tags'] = rules.get('video', {}).get('tags', [])

        return video

    def cleanup_videos(self, videos: List[Dict], config: Dict) -> tuple[List[Dict], Dict]:
        """
        Clean up videos by removing shorts and re-classifying.

        Args:
            videos: List of video dictionaries
            config: Configuration with classification rules

        Returns:
            Tuple of (cleaned videos list, statistics dict)
        """
        print(f"\n📊 Processing {len(videos)} videos...")

        # Extract video IDs
        video_ids = [v['video_id'] for v in videos]

        # Fetch durations
        print("\n🔍 Fetching video durations from YouTube API...")
        durations = self.fetch_video_durations(video_ids)
        print(f"✓ Fetched durations for {len(durations)} videos")

        # Filter and update videos
        cleaned_videos = []
        shorts_removed = 0
        reclassified = 0

        print("\n🧹 Filtering shorts and re-classifying videos...")
        for video in videos:
            video_id = video['video_id']
            duration = durations.get(video_id, 0)

            # Skip shorts (under 60 seconds)
            if duration > 0 and duration < 60:
                shorts_removed += 1
                print(f"  🗑️  Removed short: {video['title'][:50]}... ({duration}s)")
                continue

            # Add duration to video data
            video['duration_seconds'] = duration

            # Re-classify based on updated rules
            old_type = video.get('type', '')
            video = self.classify_video(video, config)

            if old_type and old_type != video['type']:
                reclassified += 1
                print(f"  🔄 Re-classified: {video['title'][:50]}... ({old_type} → {video['type']})")

            cleaned_videos.append(video)

        stats = {
            'original_count': len(videos),
            'cleaned_count': len(cleaned_videos),
            'shorts_removed': shorts_removed,
            'reclassified': reclassified
        }

        return cleaned_videos, stats


def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description='Clean up YouTube videos by removing shorts and re-classifying'
    )
    parser.add_argument(
        '--api-key',
        required=True,
        help='YouTube Data API v3 key'
    )
    parser.add_argument(
        '--input',
        required=True,
        help='Input JSON file with videos'
    )
    parser.add_argument(
        '--output',
        required=True,
        help='Output JSON file for cleaned videos'
    )
    parser.add_argument(
        '--config',
        default='config.json',
        help='Config file with classification rules (default: config.json)'
    )

    args = parser.parse_args()

    # Load existing videos
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            videos = json.load(f)
        print(f"✓ Loaded {len(videos)} videos from {args.input}")
    except FileNotFoundError:
        print(f"❌ Error: Input file not found: {args.input}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Error: Could not parse input JSON: {e}")
        sys.exit(1)

    # Load config
    try:
        with open(args.config, 'r', encoding='utf-8') as f:
            config = json.load(f)
    except FileNotFoundError:
        print(f"⚠️  Warning: Config file not found, using defaults")
        config = {}

    # Clean up videos
    cleanup = VideoCleanup(args.api_key)
    cleaned_videos, stats = cleanup.cleanup_videos(videos, config)

    # Save cleaned videos
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(cleaned_videos, f, indent=2, ensure_ascii=False)

    # Print summary
    print("\n" + "="*60)
    print("✅ CLEANUP COMPLETE!")
    print("="*60)
    print(f"Original videos:     {stats['original_count']}")
    print(f"Shorts removed:      {stats['shorts_removed']}")
    print(f"Re-classified:       {stats['reclassified']}")
    print(f"Final video count:   {stats['cleaned_count']}")
    print(f"\nSaved to: {args.output}")
    print("="*60)


if __name__ == '__main__':
    main()
