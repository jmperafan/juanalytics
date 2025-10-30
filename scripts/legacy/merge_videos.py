"""
Video Data Merger

This utility helps you incrementally update your video data by merging new videos
with your existing classified data. This is useful when:
- You've already classified some videos and don't want to lose that work
- You want to add newly published videos to your existing data
- You're working with the RSS feed (15 videos) and want to preserve older videos

Usage:
    python merge_videos.py --existing classified_videos.json --new youtube_data.json --output merged.json
"""

import argparse
import json
from typing import List, Dict


class VideoMerger:
    """Merge video data files intelligently."""

    def merge_videos(
        self,
        existing_videos: List[Dict],
        new_videos: List[Dict],
        preserve_classifications: bool = True
    ) -> List[Dict]:
        """
        Merge new videos with existing videos.

        Args:
            existing_videos: Previously saved videos (may have classifications)
            new_videos: Newly scraped videos
            preserve_classifications: Keep existing type/tags when merging

        Returns:
            Merged list of videos
        """
        # Create lookup dict by video_id for existing videos
        existing_by_id = {v['video_id']: v for v in existing_videos if v.get('video_id')}

        # Start with existing videos
        merged = []
        existing_ids = set()

        # Process existing videos first
        for video in existing_videos:
            video_id = video.get('video_id')
            if not video_id:
                continue

            existing_ids.add(video_id)

            # Check if we have updated data for this video
            if video_id in {v.get('video_id') for v in new_videos}:
                # Find the new version
                new_version = next((v for v in new_videos if v.get('video_id') == video_id), None)

                if new_version and preserve_classifications:
                    # Update with new data but preserve classifications
                    updated = new_version.copy()
                    updated['type'] = video.get('type', '')
                    updated['tags'] = video.get('tags', [])
                    merged.append(updated)
                elif new_version:
                    # Use new data completely
                    merged.append(new_version)
                else:
                    # Keep existing
                    merged.append(video)
            else:
                # Video not in new data, keep existing
                merged.append(video)

        # Add truly new videos that weren't in existing data
        for video in new_videos:
            video_id = video.get('video_id')
            if video_id and video_id not in existing_ids:
                merged.append(video)

        return merged

    def print_merge_report(
        self,
        existing_count: int,
        new_count: int,
        merged_count: int,
        truly_new: int
    ):
        """Print a report of the merge operation."""
        print("\n" + "="*60)
        print("MERGE REPORT")
        print("="*60)
        print(f"Existing videos:  {existing_count}")
        print(f"New scraped:      {new_count}")
        print(f"Total merged:     {merged_count}")
        print(f"Truly new videos: {truly_new}")
        print("="*60)

        if truly_new > 0:
            print(f"\n✓ Added {truly_new} new video(s)!")
            print("  Don't forget to classify them (set 'type' and 'tags')")
        else:
            print("\n✓ No new videos found. Your data is up to date!")


def main():
    """Main function to merge video data."""
    parser = argparse.ArgumentParser(
        description='Merge new video data with existing classified data'
    )
    parser.add_argument(
        '--existing',
        required=True,
        help='Existing JSON file with classified videos'
    )
    parser.add_argument(
        '--new',
        required=True,
        help='Newly scraped JSON file'
    )
    parser.add_argument(
        '--output',
        required=True,
        help='Output JSON file for merged data'
    )
    parser.add_argument(
        '--no-preserve',
        action='store_true',
        help='Do not preserve existing classifications (overwrite with new data)'
    )

    args = parser.parse_args()

    # Load existing data
    try:
        with open(args.existing, 'r', encoding='utf-8') as f:
            existing_videos = json.load(f)
        print(f"Loaded {len(existing_videos)} existing videos from {args.existing}")
    except FileNotFoundError:
        print(f"Warning: Existing file not found: {args.existing}")
        print("Starting with empty existing data...")
        existing_videos = []
    except json.JSONDecodeError as e:
        print(f"Error: Could not parse existing JSON: {e}")
        return

    # Load new data
    try:
        with open(args.new, 'r', encoding='utf-8') as f:
            new_videos = json.load(f)
        print(f"Loaded {len(new_videos)} new videos from {args.new}")
    except FileNotFoundError:
        print(f"Error: New file not found: {args.new}")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Could not parse new JSON: {e}")
        return

    # Merge
    merger = VideoMerger()
    merged_videos = merger.merge_videos(
        existing_videos,
        new_videos,
        preserve_classifications=not args.no_preserve
    )

    # Calculate truly new videos
    existing_ids = {v.get('video_id') for v in existing_videos if v.get('video_id')}
    new_ids = {v.get('video_id') for v in new_videos if v.get('video_id')}
    truly_new = len(new_ids - existing_ids)

    # Save merged data
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(merged_videos, f, indent=2, ensure_ascii=False)

    # Print report
    merger.print_merge_report(
        len(existing_videos),
        len(new_videos),
        len(merged_videos),
        truly_new
    )

    print(f"\n✓ Saved merged data to: {args.output}")
    print("\nNext steps:")
    print(f"1. Review the new videos in: {args.output}")
    print("2. Classify any unclassified videos (set 'type' and 'tags')")
    print("3. Generate content: python generate_content.py --input " + args.output)


if __name__ == '__main__':
    main()
