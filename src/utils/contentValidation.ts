/**
 * Content Validation Utilities
 * Validates YAML content and blog post data
 */

import type { ContentItem } from './yamlParser';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a content item (video, podcast, talk, book)
 */
export function validateContentItem(item: ContentItem, index: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!item.title || item.title.trim() === '') {
    errors.push(`Item ${index}: Missing title`);
  }

  if (!item.url || item.url.trim() === '') {
    errors.push(`Item ${index}: Missing URL`);
  } else if (!isValidUrl(item.url)) {
    errors.push(`Item ${index}: Invalid URL format: ${item.url}`);
  }

  if (!item.description || item.description.trim() === '') {
    warnings.push(`Item ${index} "${item.title}": Missing description`);
  }

  if (!item.date) {
    errors.push(`Item ${index} "${item.title}": Missing date`);
  } else if (isNaN(item.date.getTime())) {
    errors.push(`Item ${index} "${item.title}": Invalid date format`);
  }

  // Optional but recommended fields
  if (!item.tags || item.tags.length === 0) {
    warnings.push(`Item ${index} "${item.title}": No tags specified`);
  }

  if (!item.thumbnail) {
    warnings.push(`Item ${index} "${item.title}": No thumbnail specified`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an array of content items
 */
export function validateContentArray(items: ContentItem[], type: string): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  items.forEach((item, index) => {
    const result = validateContentItem(item, index + 1);
    allErrors.push(...result.errors.map(e => `[${type}] ${e}`));
    allWarnings.push(...result.warnings.map(w => `[${type}] ${w}`));
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Validates image path exists (for build-time checking)
 */
export function validateImagePath(imagePath: string): boolean {
  // In a real implementation, this would check if the file exists
  // For now, just validate the path format
  if (!imagePath) return false;

  // Check for valid image extensions
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const hasValidExtension = validExtensions.some(ext => imagePath.toLowerCase().endsWith(ext));

  // Check if it's a URL or local path
  const isUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');
  const isLocalPath = imagePath.startsWith('/') || imagePath.startsWith('./');

  return hasValidExtension && (isUrl || isLocalPath);
}

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative URL
    return url.startsWith('/');
  }
}

/**
 * Logs validation results
 */
export function logValidationResults(result: ValidationResult, context: string): void {
  if (result.errors.length > 0) {
    console.error(`❌ ${context} validation errors:`);
    result.errors.forEach(error => console.error(`  - ${error}`));
  }

  if (result.warnings.length > 0 && !import.meta.env.PROD) {
    console.warn(`⚠️  ${context} validation warnings:`);
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log(`✅ ${context} validation passed`);
  }
}
