/**
 * Helper utilities for parsing and sanitizing image URLs,
 * with full support for ImgBB codes:
 * - Embed codes (<script>, <iframe>)
 * - Viewer links (https://ibb.co/xyz, https://ibb.co.com/xyz)
 * - Direct Links (https://i.ibb.co/xyz/image.png)
 * - HTML Codes & HTML full linked (<a href="..."><img src="..." .../></a>)
 * - HTML thumbnail linked (<a href="..."><img src="...th.png" .../></a>)
 * - BBCodes & BBCode full linked ([url=...][img]...[/img][/url])
 * - BBCode thumbnail linked ([url=...][img]...th.png[/img][/url])
 * - Markdown image syntax (![alt](url))
 */

export function cleanImageUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // 1. HTML <img> tag (e.g. ImgBB HTML full / thumbnail embed code: <img src="https://i.ibb.co/..." />)
  const htmlImgMatch = trimmed.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlImgMatch && htmlImgMatch[1]) {
    return normalizeDirectImageUrl(htmlImgMatch[1]);
  }

  // 2. BBCode [img]...[/img] (e.g. [url=...][img]https://i.ibb.co/...[/img][/url] or thumbnail linked)
  const bbcodeMatch = trimmed.match(/\[img\]\s*(https?:\/\/[^\]\s]+)\s*\[\/img\]/i);
  if (bbcodeMatch && bbcodeMatch[1]) {
    return normalizeDirectImageUrl(bbcodeMatch[1]);
  }

  // 3. Markdown image syntax [![alt](url)](link) or ![alt](url)
  const markdownMatch = trimmed.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i);
  if (markdownMatch && markdownMatch[1]) {
    return normalizeDirectImageUrl(markdownMatch[1]);
  }

  // 4. HTML <a> href to an image directly (if no <img> tag exists)
  const htmlHrefMatch = trimmed.match(/href=["'](https?:\/\/[^"']+\.(?:png|jpe?g|webp|gif|svg|avif))["']/i);
  if (htmlHrefMatch && htmlHrefMatch[1]) {
    return normalizeDirectImageUrl(htmlHrefMatch[1]);
  }

  // 5. Script / Embed tag containing ibb.co viewer url or direct url
  const scriptMatch = trimmed.match(/src=["'](?:https?:)?\/\/ibb\.co\/(?:image\/)?([a-zA-Z0-9]+)["']/i);
  if (scriptMatch && scriptMatch[1]) {
    return `https://ibb.co/${scriptMatch[1]}`;
  }

  // 6. Direct i.ibb.co URL inside text or raw URL
  const ibbDirectMatch = trimmed.match(/(https?:\/\/i\.ibb\.co(?:\.com)?\/[^\s"'<>]+)/i);
  if (ibbDirectMatch && ibbDirectMatch[1]) {
    return normalizeDirectImageUrl(ibbDirectMatch[1]);
  }

  // 7. General Raw URL starting with http/https
  const urlMatch = trimmed.match(/(https?:\/\/[^\s"'<>]+)/i);
  if (urlMatch && urlMatch[1]) {
    return normalizeDirectImageUrl(urlMatch[1]);
  }

  return trimmed;
}

/**
 * Normalizes direct image links, automatically upgrading ImgBB medium/thumb
 * preview URLs (.th.jpg, .md.jpg, .th.png, etc.) to full-resolution images.
 */
export function normalizeDirectImageUrl(url: string): string {
  let clean = url.trim();

  // Clean trailing punctuation or brackets
  clean = clean.replace(/[),;>]+$/, '');

  // ImgBB resolution upgrade: replace .md.ext or .th.ext with full resolution original
  if (clean.includes('i.ibb.co') || clean.includes('i.ibb.co.com')) {
    // Strips .th. or .md. thumbnail suffix so high-CTR artwork renders in crisp full resolution
    clean = clean.replace(/\.(?:th|md)\.([a-zA-Z0-9]+)($|\?)/i, '.$1$2');
  }

  return clean;
}

/**
 * Checks if a string contains ImgBB embed code, viewer link, or BBCode
 */
export function isImgbbCode(input: string): boolean {
  if (!input) return false;
  return (
    input.includes('<img') ||
    input.includes('[img]') ||
    input.includes('ibb.co') ||
    input.includes('i.ibb.co') ||
    input.includes('ibb.co.com')
  );
}

/**
 * Detects the specific ImgBB format for user feedback in admin
 */
export function detectImgbbFormat(input: string): string | null {
  if (!input) return null;
  const s = input.trim();
  if (/<img[^>]+src=/i.test(s)) {
    if (/\.(?:th|md)\./i.test(s)) return 'HTML Thumbnail Linked (Auto-Upgraded to Full Res)';
    return 'HTML Full Linked';
  }
  if (/\[img\]/i.test(s)) {
    if (/\.(?:th|md)\./i.test(s)) return 'BBCode Thumbnail Linked (Auto-Upgraded to Full Res)';
    return 'BBCode Full Linked';
  }
  if (s.includes('<script') || s.includes('<iframe')) {
    return 'Embed Code';
  }
  if (/https?:\/\/i\.ibb\.co/i.test(s)) {
    if (/\.(?:th|md)\./i.test(s)) return 'ImgBB Thumbnail (Auto-Upgraded to Full Res)';
    return 'ImgBB Direct Link';
  }
  if (/https?:\/\/(?:www\.)?ibb\.co(?:\.com)?\/[a-zA-Z0-9]+/i.test(s)) {
    return 'ImgBB Viewer Link';
  }
  return null;
}

/**
 * Resolves an ImgBB Viewer link (e.g. https://ibb.co/xyz) to its direct image URL
 * by fetching open-graph metadata if needed.
 */
export async function resolveImgbbViewerUrl(input: string): Promise<string> {
  const cleaned = cleanImageUrl(input);

  // If already a direct image link
  if (cleaned.includes('i.ibb.co') || /\.(?:png|jpe?g|webp|gif|svg|avif)(?:\?.*)?$/i.test(cleaned)) {
    return normalizeDirectImageUrl(cleaned);
  }

  // Check for viewer link: ibb.co/xyz
  const viewerMatch = cleaned.match(/https?:\/\/(?:www\.)?ibb\.co(?:\.com)?\/([a-zA-Z0-9]+)/i);
  if (!viewerMatch) {
    return cleaned;
  }

  const viewerUrl = viewerMatch[0];

  try {
    // Attempt resolution via public CORS proxy to parse the og:image meta tag
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(viewerUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const html = await res.text();
      // Look for og:image or direct image in HTML
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
                      html.match(/<img[^>]+id=["']image-viewer["'][^>]+src=["']([^"']+)["']/i);
      if (ogMatch && ogMatch[1]) {
        return normalizeDirectImageUrl(ogMatch[1]);
      }
    }
  } catch (err) {
    console.warn('Could not auto-resolve ImgBB viewer page directly:', err);
  }

  return cleaned;
}
