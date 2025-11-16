/**
 * Video utilities for extracting IDs and building embed URLs
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
    /youtube\.com\/shorts\/([^&\s]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Extract Vimeo video ID from Vimeo URL
 */
export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Get embed URL for a video based on platform
 */
export function getEmbedUrl(videoUrl: string, platform: string = 'youtube'): string {
  if (platform === 'youtube' || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = extractYouTubeId(videoUrl);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
  } else if (platform === 'vimeo' || videoUrl.includes('vimeo.com')) {
    const videoId = extractVimeoId(videoUrl);
    return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : '';
  }
  return videoUrl;
}
