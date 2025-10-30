"""
Auto-Classification Script

Automatically classifies YouTube videos based on configurable rules.
Used by the GitHub Action workflow.

Usage:
    python auto_classify.py --input videos.json --output classified.json
"""

import argparse
import json
from typing import List, Dict


class VideoClassifier:
    """Auto-classify videos based on title patterns."""

    def __init__(self, config_file: str = 'config.json'):
        """Initialize with config file."""
        try:
            with open(config_file, 'r') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            print(f"Warning: Config file not found, using defaults")
            self.config = self._default_config()

    def _default_config(self) -> Dict:
        """Return default classification config."""
        return {
            "auto_classification": {
                "enabled": True,
                "rules": {
                    "podcast": {
                        "keywords": ["podcast", "episode", "interview", "conversation"],
                        "tags": ["podcast"]
                    },
                    "video": {
                        "default": True,
                        "tags": []
                    }
                }
            }
        }

    def classify_video(self, video: Dict) -> Dict:
        """
        Classify a single video based on rules.

        Args:
            video: Video dictionary

        Returns:
            Video dictionary with type and tags filled in
        """
        # Skip if already classified
        if video.get('type'):
            return video

        title_lower = video['title'].lower()
        description_lower = video.get('description', '').lower()
        combined_text = f"{title_lower} {description_lower}"

        rules = self.config.get('auto_classification', {}).get('rules', {})

        # Check podcast keywords
        podcast_keywords = rules.get('podcast', {}).get('keywords', [])
        if any(keyword in combined_text for keyword in podcast_keywords):
            video['type'] = 'podcast'
            video['tags'] = rules.get('podcast', {}).get('tags', ['podcast'])
            return video

        # Default to video
        video['type'] = 'video'
        video['tags'] = rules.get('video', {}).get('tags', [])

        return video

    def classify_all(self, videos: List[Dict]) -> List[Dict]:
        """
        Classify all videos.

        Args:
            videos: List of video dictionaries

        Returns:
            List of classified videos
        """
        if not self.config.get('auto_classification', {}).get('enabled', True):
            print("Auto-classification is disabled")
            return videos

        classified_count = 0
        skipped_count = 0

        for video in videos:
            if video.get('type'):
                skipped_count += 1
                continue

            self.classify_video(video)
            classified_count += 1
            print(f"✓ Classified: {video['title'][:60]}... → {video['type']}")

        print(f"\n📊 Classification Summary:")
        print(f"   Newly classified: {classified_count}")
        print(f"   Already classified: {skipped_count}")

        return videos


def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description='Auto-classify YouTube videos'
    )
    parser.add_argument(
        '--input',
        required=True,
        help='Input JSON file with videos'
    )
    parser.add_argument(
        '--output',
        required=True,
        help='Output JSON file for classified videos'
    )
    parser.add_argument(
        '--config',
        default='config.json',
        help='Config file (default: config.json)'
    )

    args = parser.parse_args()

    # Load videos
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            videos = json.load(f)
        print(f"Loaded {len(videos)} videos from {args.input}")
    except FileNotFoundError:
        print(f"Error: Input file not found: {args.input}")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Could not parse input JSON: {e}")
        return

    # Classify
    classifier = VideoClassifier(args.config)
    classified_videos = classifier.classify_all(videos)

    # Save
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(classified_videos, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Saved {len(classified_videos)} videos to {args.output}")


if __name__ == '__main__':
    main()
