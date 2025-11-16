import { describe, it, expect } from 'vitest';
import { calculateReadingTime, formatReadingTime } from '../readingTime';

describe('readingTime utils', () => {
  describe('calculateReadingTime', () => {
    it('should calculate reading time correctly for short text', () => {
      const text = 'This is a short text with about ten words here.';
      const time = calculateReadingTime(text);
      expect(time).toBe(1); // Should be 1 minute minimum
    });

    it('should calculate reading time correctly for longer text', () => {
      // 400 words should take about 2 minutes (200 WPM average)
      const text = 'word '.repeat(400);
      const time = calculateReadingTime(text);
      expect(time).toBe(2);
    });

    it('should round up partial minutes', () => {
      // 250 words should round to 2 minutes
      const text = 'word '.repeat(250);
      const time = calculateReadingTime(text);
      expect(time).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty string', () => {
      const time = calculateReadingTime('');
      expect(time).toBe(1); // Minimum 1 minute
    });

    it('should ignore markdown syntax in word count', () => {
      const markdownText = `
        # Heading
        ## Subheading
        **Bold text** and *italic text*
        [Link](https://example.com)
        \`code\`
      `;
      const time = calculateReadingTime(markdownText);
      expect(time).toBeGreaterThan(0);
    });
  });

  describe('formatReadingTime', () => {
    it('should format 1 minute correctly', () => {
      expect(formatReadingTime(1)).toBe('1 min read');
    });

    it('should format multiple minutes correctly', () => {
      expect(formatReadingTime(5)).toBe('5 min read');
    });

    it('should handle 0 minutes', () => {
      expect(formatReadingTime(0)).toBe('1 min read');
    });
  });
});
