#!/bin/sh
set -e

echo "=================================="
echo "Docker Build Process Starting"
echo "=================================="
echo ""

# Step 1: Sync content
echo "Step 1: Syncing content.yml with markdown files..."
python3 scripts/sync_content.py

if [ $? -ne 0 ]; then
    echo "ERROR: Content sync failed!"
    exit 1
fi

echo ""
echo "Step 2: Building Astro site..."
npm run build

if [ $? -ne 0 ]; then
    echo "ERROR: Astro build failed!"
    exit 1
fi

echo ""
echo "=================================="
echo "Build Complete!"
echo "=================================="
