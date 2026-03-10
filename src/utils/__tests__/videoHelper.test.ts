import { describe, it, expect } from 'vitest';
import { extractYouTubeId, extractVimeoId, getEmbedUrl } from '../videoHelper';

describe('videoHelper', () => {
  describe('extractYouTubeId', () => {
    it('extracts ID from standard watch URL', () => {
      expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from short youtu.be URL', () => {
      expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from embed URL', () => {
      expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts ID from shorts URL', () => {
      expect(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('returns null for non-YouTube URL', () => {
      expect(extractYouTubeId('https://vimeo.com/123456')).toBeNull();
    });

    it('returns null for unrelated URL', () => {
      expect(extractYouTubeId('https://example.com')).toBeNull();
    });
  });

  describe('extractVimeoId', () => {
    it('extracts ID from Vimeo URL', () => {
      expect(extractVimeoId('https://vimeo.com/123456789')).toBe('123456789');
    });

    it('returns null for non-Vimeo URL', () => {
      expect(extractVimeoId('https://youtube.com/watch?v=abc')).toBeNull();
    });
  });

  describe('getEmbedUrl', () => {
    it('returns YouTube embed URL with autoplay for youtube.com', () => {
      const result = getEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
    });

    it('returns YouTube embed URL for youtu.be', () => {
      const result = getEmbedUrl('https://youtu.be/dQw4w9WgXcQ');
      expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
    });

    it('returns Vimeo embed URL with autoplay when platform is vimeo', () => {
      const result = getEmbedUrl('https://vimeo.com/123456789', 'vimeo');
      expect(result).toBe('https://player.vimeo.com/video/123456789?autoplay=1');
    });

    it('returns empty string for YouTube URL with unrecognized format', () => {
      const result = getEmbedUrl('https://www.youtube.com/channel/abc');
      expect(result).toBe('');
    });

    it('returns the URL as-is for unknown platforms', () => {
      const result = getEmbedUrl('https://example.com/video.mp4', 'other');
      expect(result).toBe('https://example.com/video.mp4');
    });
  });
});
