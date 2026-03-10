import { describe, it, expect } from 'vitest';
import { validateContentItem, validateContentArray, validateImagePath, logValidationResults } from '../contentValidation';
import type { ContentItem } from '../yamlParser';

const validItem: ContentItem = {
  type: 'video',
  title: 'Test Video',
  url: 'https://youtube.com/watch?v=abc123',
  description: 'A test video',
  date: new Date('2024-01-01'),
  tags: ['test', 'video'],
  thumbnail: '/images/test.jpg',
};

describe('validateContentItem', () => {
  it('passes for a fully valid item', () => {
    const result = validateContentItem(validItem, 1);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('errors when title is missing', () => {
    const item = { ...validItem, title: '' };
    const result = validateContentItem(item, 1);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('title'))).toBe(true);
  });

  it('errors when URL is missing', () => {
    const item = { ...validItem, url: '' };
    const result = validateContentItem(item, 1);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('URL'))).toBe(true);
  });

  it('errors when URL format is invalid', () => {
    const item = { ...validItem, url: 'not-a-url' };
    const result = validateContentItem(item, 1);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid URL'))).toBe(true);
  });

  it('accepts relative URLs', () => {
    const item = { ...validItem, url: '/relative/path' };
    const result = validateContentItem(item, 1);
    expect(result.isValid).toBe(true);
  });

  it('errors when date is missing', () => {
    const item = { ...validItem, date: undefined as unknown as Date };
    const result = validateContentItem(item, 1);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('date'))).toBe(true);
  });

  it('errors when date is invalid', () => {
    const item = { ...validItem, date: new Date('not-a-date') };
    const result = validateContentItem(item, 1);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('date'))).toBe(true);
  });

  it('warns when description is missing', () => {
    const item = { ...validItem, description: '' };
    const result = validateContentItem(item, 1);
    expect(result.isValid).toBe(true);
    expect(result.warnings.some(w => w.includes('description'))).toBe(true);
  });

  it('warns when tags are empty', () => {
    const item = { ...validItem, tags: [] };
    const result = validateContentItem(item, 1);
    expect(result.warnings.some(w => w.includes('tags'))).toBe(true);
  });

  it('warns when thumbnail is missing', () => {
    const item = { ...validItem, thumbnail: undefined };
    const result = validateContentItem(item, 1);
    expect(result.warnings.some(w => w.includes('thumbnail'))).toBe(true);
  });
});

describe('validateContentArray', () => {
  it('passes for an array of valid items', () => {
    const result = validateContentArray([validItem, validItem], 'videos');
    expect(result.isValid).toBe(true);
  });

  it('prefixes errors with content type', () => {
    const badItem = { ...validItem, title: '' };
    const result = validateContentArray([badItem], 'podcasts');
    expect(result.errors.every(e => e.startsWith('[podcasts]'))).toBe(true);
  });

  it('passes for empty array', () => {
    const result = validateContentArray([], 'books');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateImagePath', () => {
  it('accepts valid remote image URL', () => {
    expect(validateImagePath('https://example.com/image.jpg')).toBe(true);
  });

  it('accepts valid local path', () => {
    expect(validateImagePath('/images/photo.png')).toBe(true);
  });

  it('accepts relative local path', () => {
    expect(validateImagePath('./images/photo.webp')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateImagePath('')).toBe(false);
  });

  it('rejects unsupported extension', () => {
    expect(validateImagePath('/images/file.txt')).toBe(false);
  });

  it('rejects URL without valid extension', () => {
    expect(validateImagePath('https://example.com/image')).toBe(false);
  });
});

describe('logValidationResults', () => {
  it('does not throw for valid results', () => {
    const result = { isValid: true, errors: [], warnings: [] };
    expect(() => logValidationResults(result, 'test')).not.toThrow();
  });

  it('does not throw for results with errors', () => {
    const result = { isValid: false, errors: ['error 1'], warnings: [] };
    expect(() => logValidationResults(result, 'test')).not.toThrow();
  });
});
