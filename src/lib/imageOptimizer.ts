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
 * Returns an edge-optimized, lightweight WebP/AVIF image URL for external images (2k/4k PNG/JPG)
 * using the global Cloudflare-backed wsrv.nl image proxy.
 *
 * Automatically reduces multi-megabyte 2K/4K raw uploads down to crisp,
 * lightweight (~20-40KB) WebP variants tailored to device resolution,
 * preventing mobile lag, memory exhaustion, and slow rendering on initial site visits.
 */
export function getOptimizedImageUrl(
  rawUrl?: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!rawUrl) return '';
  const cleaned = cleanImageUrl(rawUrl).trim();

  // Return data URIs and inline SVGs as-is without proxying
  if (
    cleaned.startsWith('data:') ||
    cleaned.endsWith('.svg') ||
    cleaned.includes('.svg?')
  ) {
    return cleaned;
  }

  // Only optimize valid http/https URLs
  if (!/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }

  const {
    width = 800,
    height,
    quality = 80,
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
 * Generates a responsive srcset string with multiple resolution variants (e.g. 400w, 800w, 1200w).
 */
export function getResponsiveSrcSet(
  rawUrl?: string,
  widths: number[] = [400, 800, 1200],
  quality = 80
): string | undefined {
  if (!rawUrl) return undefined;
  const cleaned = cleanImageUrl(rawUrl).trim();

  if (
    cleaned.startsWith('data:') ||
    cleaned.endsWith('.svg') ||
    cleaned.includes('.svg?') ||
    !/^https?:\/\//i.test(cleaned)
  ) {
    return undefined;
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
