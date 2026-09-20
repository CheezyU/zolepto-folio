import React from 'react';
import { cleanImageUrl } from './imageUtils';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
}

/**
 * Returns an edge-optimized image URL.
 * Direct hosts (ImgBB i.ibb.co, Unsplash images.unsplash.com, YouTube i.ytimg.com)
 * are served directly from their native ultra-fast CDNs to avoid third-party proxy lag,
 * rate-limiting, and compression artifacts.
 */
export function getOptimizedImageUrl(
  rawUrl?: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!rawUrl) return '';
  const cleaned = cleanImageUrl(rawUrl).trim();

  // Return data URIs, local assets, and inline SVGs as-is without proxying
  if (
    cleaned.startsWith('data:') ||
    cleaned.startsWith('/') ||
    cleaned.endsWith('.svg') ||
    cleaned.includes('.svg?')
  ) {
    return cleaned;
  }

  // Only process valid http/https URLs
  if (!/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }

  // 1. ImgBB direct hosting: served directly via ImgBB's global edge CDN.
  // Never route through wsrv.nl proxy because ImgBB rate-limits/blocks proxy bots, causing severe lag and blank images.
  if (cleaned.includes('i.ibb.co') || cleaned.includes('ibb.co')) {
    return cleaned;
  }

  // 2. YouTube thumbnails: native global Google CDN
  if (cleaned.includes('ytimg.com') || cleaned.includes('youtube.com')) {
    return cleaned;
  }

  // 3. Unsplash: Use Unsplash's native edge transformation parameters for instant load
  if (cleaned.includes('images.unsplash.com')) {
    try {
      const u = new URL(cleaned);
      const { width = 800, quality = 85 } = options;
      if (width) u.searchParams.set('w', width.toString());
      if (quality) u.searchParams.set('q', quality.toString());
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', options.fit || 'crop');
      return u.toString();
    } catch {
      return cleaned;
    }
  }

  const {
    width = 800,
    height,
    quality = 85,
    format = 'webp',
    fit = 'cover',
  } = options;

  const params = new URLSearchParams();
  params.set('url', cleaned);
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality) params.set('q', quality.toString());
  if (format && format !== 'auto') params.set('output', format);
  if (fit) params.set('fit', fit);

  return `https://wsrv.nl/?${params.toString()}`;
}

/**
 * Generates a responsive srcset string with multiple resolution variants.
 * Omits proxy for direct CDN hosts (ImgBB, YouTube) so they load instantly without queuing.
 */
export function getResponsiveSrcSet(
  rawUrl?: string,
  widths: number[] = [400, 800, 1200],
  quality = 85
): string | undefined {
  if (!rawUrl) return undefined;
  const cleaned = cleanImageUrl(rawUrl).trim();

  if (
    cleaned.startsWith('data:') ||
    cleaned.startsWith('/') ||
    cleaned.endsWith('.svg') ||
    cleaned.includes('.svg?') ||
    !/^https?:\/\//i.test(cleaned)
  ) {
    return undefined;
  }

  // Direct CDNs that already serve full quality without proxy
  if (
    cleaned.includes('i.ibb.co') ||
    cleaned.includes('ibb.co') ||
    cleaned.includes('ytimg.com')
  ) {
    return undefined;
  }

  if (cleaned.includes('images.unsplash.com')) {
    try {
      return widths
        .map((w) => {
          const u = new URL(cleaned);
          u.searchParams.set('w', w.toString());
          u.searchParams.set('q', quality.toString());
          u.searchParams.set('auto', 'format');
          return `${u.toString()} ${w}w`;
        })
        .join(', ');
    } catch {
      return undefined;
    }
  }

  return widths
    .map((w) => `${getOptimizedImageUrl(cleaned, { width: w, quality })} ${w}w`)
    .join(', ');
}

/**
 * Failsafe error handler for optimized images:
 * If wsrv.nl fails or times out, smoothly cascades back to the original raw URL,
 * and if that fails, cascades to the provided fallback placeholder.
 */
export function handleOptimizedImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl?: string,
  fallbackUrl?: string
) {
  const target = e.currentTarget;
  const currentSrc = target.src || '';
  const raw = originalUrl ? cleanImageUrl(originalUrl) : '';

  // If failed on wsrv.nl proxy, revert to original raw URL
  if (currentSrc.includes('wsrv.nl') && raw && currentSrc !== raw) {
    target.srcset = '';
    target.src = raw;
    return;
  }

  // If original URL also failed, fallback to placeholder
  if (fallbackUrl && currentSrc !== fallbackUrl) {
    target.srcset = '';
    target.src = fallbackUrl;
  }
}
