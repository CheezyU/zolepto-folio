/**
 * Extracts YouTube video ID from various YouTube URL formats.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already a clean 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle standard watch URLs, short URLs, embed URLs, live URLs, and shorts
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/**
 * Returns the highest resolution YouTube thumbnail available.
 * Defaults to maxresdefault (1280x720 HD, no pillarbox/letterbox bars).
 * Falls back safely to sddefault (640x480) or hqdefault (480x360).
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'maxres' | 'sd' | 'hq' = 'maxres'
): string {
  if (!videoId) return '';
  const cleanId = videoId.trim();
  if (quality === 'maxres') {
    return `https://i.ytimg.com/vi/${cleanId}/maxresdefault.jpg`;
  }
  if (quality === 'sd') {
    return `https://i.ytimg.com/vi/${cleanId}/sddefault.jpg`;
  }
  return `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`;
}

/**
 * Upgrades any legacy pixelated hqdefault/mqdefault/sddefault/0 YouTube thumbnail URLs to pristine maxresdefault HD.
 */
export function upgradeYouTubeThumbnailUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If already maxresdefault, ensure fast i.ytimg.com CDN
  if (trimmed.includes('/maxresdefault.jpg')) {
    return trimmed.replace('img.youtube.com', 'i.ytimg.com');
  }

  // Extract ID from any YouTube thumbnail URL format: /vi/<id>/...
  const ytThumbMatch = trimmed.match(/(?:ytimg\.com|youtube\.com)\/vi\/([a-zA-Z0-9_-]{11})\//);
  if (ytThumbMatch && ytThumbMatch[1]) {
    return `https://i.ytimg.com/vi/${ytThumbMatch[1]}/maxresdefault.jpg`;
  }

  // If it's a YouTube watch/embed/short link passed as thumbnail
  const directId = extractYouTubeId(trimmed);
  if (directId) {
    return `https://i.ytimg.com/vi/${directId}/maxresdefault.jpg`;
  }

  if (
    trimmed.includes('/hqdefault.jpg') ||
    trimmed.includes('/mqdefault.jpg') ||
    trimmed.includes('/default.jpg') ||
    trimmed.includes('/sddefault.jpg') ||
    trimmed.includes('/0.jpg')
  ) {
    return trimmed
      .replace('img.youtube.com', 'i.ytimg.com')
      .replace(/\/(hqdefault|mqdefault|default|sddefault|0)\.jpg/, '/maxresdefault.jpg');
  }

  return trimmed;
}

/**
 * Reusable image error handler that automatically cascades from maxresdefault -> sddefault -> hqdefault -> fallback.
 */
export function handleThumbnailImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl?: string
) {
  const target = e.currentTarget;
  const src = target.src || '';
  if (src.includes('maxresdefault.jpg')) {
    target.src = src.replace('maxresdefault.jpg', 'sddefault.jpg');
  } else if (src.includes('sddefault.jpg')) {
    target.src = src.replace('sddefault.jpg', 'hqdefault.jpg');
  } else if (fallbackUrl && src !== fallbackUrl) {
    target.src = fallbackUrl;
  }
}

/**
 * Reusable image load handler that detects YouTube's 120x90 "not available" placeholder and steps down to hqdefault.
 */
export function handleThumbnailImageLoad(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src.includes('maxresdefault.jpg') && target.naturalWidth === 120) {
    target.src = target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
  }
}
