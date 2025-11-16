import { describe, it, expect } from 'vitest';
import { buildUrl } from '../urlHelper';

describe('urlHelper', () => {
  describe('buildUrl', () => {
    it('should build URL with leading slash', () => {
      expect(buildUrl('about')).toBe('/about');
    });

    it('should handle empty string', () => {
      expect(buildUrl('')).toBe('/');
    });

    it('should handle path with leading slash', () => {
      expect(buildUrl('/blog')).toBe('/blog');
    });

    it('should handle nested paths', () => {
      expect(buildUrl('blog/my-post')).toBe('/blog/my-post');
    });

    it('should not double slash', () => {
      expect(buildUrl('//')).toBe('/');
    });
  });
});
