#!/usr/bin/env python3
"""Script to standardize tags across all content files."""

import os
import re
from pathlib import Path

# Define tag mappings from old to new standardized tags
TAG_MAPPINGS = {
    # Videos
    ('power-bi', 'r', 'visualization', 'tutorial'): ['power bi', 'r', 'data visualization'],
    ('dashboards', 'scoping', 'project management'): ['data visualization', 'project management'],
    ('dbt', 'tutorial', 'beginner', 'analytics-engineering'): ['dbt', 'analytics engineering'],
    ('analytics engineering', 'career', 'data teams'): ['analytics engineering', 'career development'],
    ('Tableau', 'visualization', 'español'): ['tableau', 'data visualization'],
    ('dbt', 'excel', 'data sources'): ['dbt', 'excel'],
    ('data governance', 'analytics engineering', 'best practices'): ['analytics engineering', 'data strategy'],
    ('TEDx', 'culture', 'latinx'): ['community building'],
    ('Tableau', 'performance', 'Nederlands'): ['tableau', 'performance tuning'],
    ('data democratization', 'self-service', 'analytics'): ['data strategy', 'business intelligence'],
    ('community', 'open source', 'tech'): ['community building'],
    ('Tableau', 'R', 'Python', 'integration'): ['tableau', 'r', 'python'],
    ('meetups', 'community', 'event organization'): ['community building'],
    ('dbt', 'KPIs', 'documentation', 'semantic layer'): ['dbt', 'data strategy'],

    # Podcasts
    ('analytics', 'data'): ['analytics engineering'],
    ('marketing', 'career'): ['marketing', 'career development'],
    ('career', 'analytics engineering'): ['analytics engineering', 'career development'],
    ('data engineering', 'analytics engineering', 'modern data stack'): ['data engineering', 'analytics engineering'],
    ('career',): ['career development'],

    # Blog
    ('welcome', 'analytics-engineering', 'dbt'): ['analytics engineering', 'dbt'],
    ('analytics engineering', 'dbt', 'book', 'data'): ['analytics engineering', 'dbt'],

    # Talks
    ('metrics', 'strategy'): ['data strategy'],
    ('dashboards', 'project management'): ['data visualization', 'project management'],
    ('dbt', 'semantic layer', 'analytics engineering'): ['dbt', 'analytics engineering'],
    ('dbt', 'analytics engineering', 'career'): ['dbt', 'analytics engineering', 'career development'],
    ('data visualization', 'UX'): ['data visualization'],
    ('dbt', 'analytics engineering'): ['dbt', 'analytics engineering'],
    ('snowflake', 'security'): ['snowflake', 'security'],
    ('Power BI', 'Tableau', 'Business Intelligence'): ['power bi', 'tableau', 'business intelligence'],
    ('data maturity', 'strategy'): ['data strategy'],
    ('dbt', 'testing'): ['dbt', 'testing'],
    ('dbt', 'snowflake'): ['dbt', 'snowflake'],
    ('Business Intelligence',): ['business intelligence'],
    ('psychology',): ['psychology'],
    ('dbt', 'performance tuning'): ['dbt', 'performance tuning'],
}

def normalize_tag_tuple(tags):
    """Convert a list of tags to a normalized tuple for matching."""
    return tuple(tags)

def update_tags_in_file(file_path):
    """Update tags in a single file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the tags line using regex
    tags_pattern = r"tags:\s*\[([^\]]+)\]"
    match = re.search(tags_pattern, content)

    if not match:
        return False

    # Extract current tags
    tags_str = match.group(1)
    current_tags = [tag.strip().strip("'\"") for tag in tags_str.split(',')]
    current_tuple = tuple(current_tags)

    # Check if we have a mapping for these tags
    if current_tuple in TAG_MAPPINGS:
        new_tags = TAG_MAPPINGS[current_tuple]
        new_tags_str = ', '.join(f"'{tag}'" for tag in new_tags)
        new_line = f"tags: [{new_tags_str}]"

        # Replace in content
        new_content = re.sub(tags_pattern, new_line, content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"Updated: {file_path}")
        print(f"  Old: {current_tags}")
        print(f"  New: {new_tags}")
        return True

    return False

def main():
    """Main function to update all content files."""
    content_dir = Path(__file__).parent.parent / 'src' / 'content'

    updated_count = 0
    for file_path in content_dir.rglob('*.md'):
        if update_tags_in_file(file_path):
            updated_count += 1

    print(f"\nTotal files updated: {updated_count}")

if __name__ == '__main__':
    main()
