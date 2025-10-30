#!/usr/bin/env python3
"""
Fix common YAML syntax errors in content.yml
"""

from pathlib import Path
import re

PROJECT_ROOT = Path(__file__).parent.parent
YAML_FILE = PROJECT_ROOT / 'content.yml'

def fix_yaml_file():
    """Fix YAML syntax errors"""
    print("Reading content.yml...")

    with open(YAML_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    fixed_lines = []
    changes = 0

    for i, line in enumerate(lines, 1):
        original_line = line

        # Fix 1: Remove trailing spaces from title fields
        if line.strip().startswith('title:'):
            # If title ends with trailing space before newline, remove it
            if line.rstrip() != line.rstrip(' \t'):
                line = line.rstrip() + '\n'
                if original_line != line:
                    print(f"Line {i}: Removed trailing space from title")
                    changes += 1

        # Fix 2: Ensure colons in values are properly quoted
        if ':' in line and not line.strip().startswith('#'):
            match = re.match(r'^(\s+)(title|description|event):\s+(.+)$', line.rstrip())
            if match:
                indent, field, value = match.groups()
                # If value contains : and is not quoted, quote it
                if ':' in value and not (value.startswith("'") or value.startswith('"')):
                    # Don't quote if it's a URL field
                    if not value.startswith('http'):
                        new_line = f"{indent}{field}: '{value}'\n"
                        if new_line != line:
                            print(f"Line {i}: Quoted {field} value")
                            line = new_line
                            changes += 1

        fixed_lines.append(line)

    if changes > 0:
        # Backup original
        backup_file = YAML_FILE.with_suffix('.yml.bak')
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"\nBackup created: {backup_file}")

        # Write fixed version
        with open(YAML_FILE, 'w', encoding='utf-8') as f:
            f.writelines(fixed_lines)

        print(f"\nFixed {changes} issues in {YAML_FILE}")
    else:
        print("\nNo issues found!")

    return changes

if __name__ == '__main__':
    fix_yaml_file()
