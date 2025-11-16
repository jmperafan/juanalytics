#!/usr/bin/env node
/**
 * Image optimization script
 * Optimizes PNG and JPG images to WebP format with quality settings
 */

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Images to optimize
const images = [
  {
    input: join(projectRoot, 'public/profile_photo.png'),
    output: join(projectRoot, 'public/profile_photo.webp'),
    maxWidth: 800,
    quality: 85,
  },
  {
    input: join(projectRoot, 'public/logo.png'),
    output: join(projectRoot, 'public/logo.webp'),
    maxWidth: 400,
    quality: 85,
  },
  {
    input: join(projectRoot, 'public/logo_resized.png'),
    output: join(projectRoot, 'public/logo_resized.webp'),
    maxWidth: 400,
    quality: 85,
  },
  {
    input: join(projectRoot, 'public/sql-for-data-analytics-cover.jpg'),
    output: join(projectRoot, 'public/sql-for-data-analytics-cover.webp'),
    maxWidth: 1200,
    quality: 80,
  },
];

async function optimizeImage(config) {
  const { input, output, maxWidth, quality } = config;

  if (!existsSync(input)) {
    console.warn(`⚠️  Image not found: ${input}`);
    return;
  }

  try {
    const metadata = await sharp(input).metadata();
    console.log(`📸 Processing: ${input}`);
    console.log(`   Original size: ${(metadata.size / 1024 / 1024).toFixed(2)}MB`);

    await sharp(input)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality })
      .toFile(output);

    const outputMetadata = await sharp(output).metadata();
    console.log(`   ✅ Saved: ${output}`);
    console.log(`   New size: ${(outputMetadata.size / 1024).toFixed(2)}KB`);
    console.log(
      `   Reduction: ${(((metadata.size - outputMetadata.size) / metadata.size) * 100).toFixed(1)}%\n`
    );
  } catch (error) {
    console.error(`❌ Error processing ${input}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');

  for (const imageConfig of images) {
    await optimizeImage(imageConfig);
  }

  console.log('✨ Image optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update references from .png/.jpg to .webp in your code');
  console.log('   2. Consider keeping original images as fallbacks for older browsers');
}

main().catch(console.error);
