import { extractYouTubeId, buildYouTubeEmbedUrl, getYouTubeThumbnailUrl } from './youtube';
import { VideoProject } from '../types';

/**
 * Checks if a URL points to short-form vertical video content
 * (e.g., YouTube Shorts, Instagram Reels, TikTok, Facebook Reels).
 */
export function isShortFormUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return (
    lower.includes('/shorts/') ||
    lower.includes('shorts/') ||
    lower.includes('#shorts') ||
    lower.includes('tiktok.com') ||
    lower.includes('/reel/') ||
    lower.includes('/reels/') ||
    lower.includes('instagram.com/reel') ||
    lower.includes('instagram.com/reels') ||
    lower.includes('facebook.com/reel') ||
    lower.includes('facebook.com/reels') ||
    lower.includes('fb.watch')
  );
}

/**
 * Auto-detects if a VideoProject is short-form vertical content.
 * Checks aspectRatio ('9/16'), category ('short-form'), embed URL, YouTube URL, tags, etc.
 */
export function isShortFormVideo(video?: Partial<VideoProject> | null): boolean {
  if (!video) return false;
  if (video.aspectRatio === '9/16') return true;
  if (video.category === 'short-form') return true;

  const urlCandidates = [
    video.embedUrl,
    (video as any).videoUrl,
    (video as any).youtubeUrl,
  ].filter(Boolean);

  for (const u of urlCandidates) {
    if (isShortFormUrl(u)) return true;
  }

  // Check tags
  if (Array.isArray(video.tags)) {
    const hasShortTag = video.tags.some((t) => {
      const lower = t.toLowerCase().replace(/^#/, '').trim();
      return (
        lower === 'short' ||
        lower === 'shorts' ||
        lower === 'short-form' ||
        lower === 'shortform' ||
        lower === 'reel' ||
        lower === 'reels' ||
        lower === 'tiktok' ||
        lower === 'vertical'
      );
    });
    if (hasShortTag) return true;
  }

  // Check categoryLabel
  if (video.categoryLabel) {
    const cl = video.categoryLabel.toLowerCase();
    if (cl.includes('short') || cl.includes('reel') || cl.includes('tiktok') || cl.includes('vertical')) {
      return true;
    }
  }

  return false;
}

export interface ParsedVideoInfo {
  platform: 'youtube' | 'youtube-shorts' | 'instagram' | 'tiktok' | 'facebook' | 'generic';
  isShortForm: boolean;
  aspectRatio: '16/9' | '9/16';
  videoId?: string;
  embedUrl: string;
  thumbnailUrl?: string;
  platformLabel: string;
}

/**
 * Parses any video/embed link (YouTube, Shorts, IG Reels, TikTok, FB Reels, or generic URL).
 */
export function parseVideoUrl(inputUrl: string): ParsedVideoInfo {
  const url = (inputUrl || '').trim();
  const lower = url.toLowerCase();

  // 1. YouTube Shorts
  if (lower.includes('/shorts/')) {
    const match = url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    const id = match ? match[1] : extractYouTubeId(url);
    if (id) {
      return {
        platform: 'youtube-shorts',
        isShortForm: true,
        aspectRatio: '9/16',
        videoId: id,
        embedUrl: buildYouTubeEmbedUrl(id),
        thumbnailUrl: getYouTubeThumbnailUrl(id),
        platformLabel: 'YouTube Short',
      };
    }
  }

  // 2. Standard YouTube (watch?v=, youtu.be, embed, etc.)
  const ytId = extractYouTubeId(url);
  if (ytId) {
    const isShort = isShortFormUrl(url);
    return {
      platform: isShort ? 'youtube-shorts' : 'youtube',
      isShortForm: isShort,
      aspectRatio: isShort ? '9/16' : '16/9',
      videoId: ytId,
      embedUrl: buildYouTubeEmbedUrl(ytId),
      thumbnailUrl: getYouTubeThumbnailUrl(ytId),
      platformLabel: isShort ? 'YouTube Short' : 'YouTube',
    };
  }

  // 3. Instagram Reels
  if (
    lower.includes('instagram.com/reel') ||
    lower.includes('instagr.am/reel') ||
    lower.includes('instagram.com/reels')
  ) {
    const match = url.match(/\/reel[s]?\/([a-zA-Z0-9_-]+)/);
    const reelId = match ? match[1] : '';
    const cleanEmbed = reelId ? `https://www.instagram.com/reel/${reelId}/embed/` : url;
    return {
      platform: 'instagram',
      isShortForm: true,
      aspectRatio: '9/16',
      videoId: reelId,
      embedUrl: cleanEmbed,
      platformLabel: 'Instagram Reel',
    };
  }

  // 4. TikTok
  if (lower.includes('tiktok.com')) {
    const match = url.match(/\/video\/(\d+)/);
    const tiktokId = match ? match[1] : '';
    const cleanEmbed = tiktokId ? `https://www.tiktok.com/embed/v2/${tiktokId}` : url;
    return {
      platform: 'tiktok',
      isShortForm: true,
      aspectRatio: '9/16',
      videoId: tiktokId,
      embedUrl: cleanEmbed,
      platformLabel: 'TikTok',
    };
  }

  // 5. Facebook Reels
  if (
    lower.includes('facebook.com/reel') ||
    lower.includes('facebook.com/reels') ||
    lower.includes('fb.watch')
  ) {
    const cleanEmbed = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      url
    )}&show_text=0`;
    return {
      platform: 'facebook',
      isShortForm: true,
      aspectRatio: '9/16',
      embedUrl: cleanEmbed,
      platformLabel: 'Facebook Reel',
    };
  }

  // 6. Generic / Custom Embed
  const isShort = isShortFormUrl(url);
  return {
    platform: 'generic',
    isShortForm: isShort,
    aspectRatio: isShort ? '9/16' : '16/9',
    embedUrl: url,
    platformLabel: isShort ? 'Short-Form' : 'Video',
  };
}

/**
 * Creates an elegant SVG placeholder with 9:16 vertical smartphone proportions
 * for short-form video cards.
 */
export function createShortsPlaceholderSvg(title: string, platform = 'SHORT-FORM'): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280" fill="none">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#18181b"/>
          <stop offset="50%" stop-color="#09090b"/>
          <stop offset="100%" stop-color="#18181b"/>
        </linearGradient>
        <radialGradient id="centerGlow" cx="50%" cy="45%" r="45%">
          <stop offset="0%" stop-color="#27272a" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="720" height="1280" fill="url(#bgGrad)"/>
      <circle cx="360" cy="560" r="300" fill="url(#centerGlow)"/>

      <!-- Phone frame accent border -->
      <rect x="28" y="28" width="664" height="1224" rx="44" stroke="#27272a" stroke-width="3" stroke-dasharray="12 12"/>

      <!-- Top dynamic pill indicator -->
      <rect x="260" y="56" width="200" height="32" rx="16" fill="#27272a"/>
      <circle cx="286" cy="72" r="5" fill="#ef4444"/>
      <text x="372" y="77" font-family="monospace" font-size="12" font-weight="600" fill="#f4f4f5" text-anchor="middle" letter-spacing="2">SHORTS</text>

      <!-- Center Play & Reel ring -->
      <circle cx="360" cy="560" r="68" fill="#27272a" stroke="#3f3f46" stroke-width="2"/>
      <polygon points="352,538 384,560 352,582" fill="#fafafa"/>

      <!-- Title & Details -->
      <text x="360" y="690" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="700" fill="#f4f4f5" text-anchor="middle" letter-spacing="0.5">${title}</text>
      <text x="360" y="730" font-family="monospace" font-size="16" fill="#a1a1aa" text-anchor="middle" letter-spacing="2.5">${platform.toUpperCase()}</text>
      <text x="360" y="768" font-family="monospace" font-size="13" fill="#71717a" text-anchor="middle" letter-spacing="1">HIGH-RETENTION VERTICAL CUT</text>

      <!-- Bottom Audio / Engagement Wave indicator -->
      <line x1="220" y1="1160" x2="500" y2="1160" stroke="#3f3f46" stroke-width="2" stroke-linecap="round"/>
      <circle cx="360" cy="1160" r="8" fill="#d4d4d8"/>
    </svg>
  `)}`;
}
