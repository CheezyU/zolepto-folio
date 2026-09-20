import { VideoProject, GraphicProject, VideoCategory, GraphicCategory } from '../types';
import { VIDEO_PROJECTS as DEFAULT_VIDEOS, GRAPHIC_PROJECTS as DEFAULT_GRAPHICS } from '../data/portfolioData';
import { extractYouTubeId, buildYouTubeEmbedUrl, getYouTubeThumbnailUrl, upgradeYouTubeThumbnailUrl } from '../lib/youtube';
import { parseVideoUrl, isShortFormVideo, createShortsPlaceholderSvg } from '../lib/videoEmbed';
import { loadLivePortfolioContent, publishToGlobalCloud } from './githubSyncService';
import { getLocalSettings } from './siteSettingsService';

const LOCAL_SHOWREELS_KEY = 'zolepto_custom_showreels';
const LOCAL_GRAPHICS_KEY = 'zolepto_custom_graphics';
const HIDDEN_PROJECTS_KEY = 'zolepto_hidden_projects';
const PORTFOLIO_EVENT = 'zolepto:portfolio-changed';

function getHiddenProjectIds(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_PROJECTS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function hideProjectId(id: string) {
  try {
    const set = getHiddenProjectIds();
    set.add(id);
    localStorage.setItem(HIDDEN_PROJECTS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Failed to save hidden project id', err);
  }
}

function mergeShowreels(customList: VideoProject[], defaults: VideoProject[]): VideoProject[] {
  const hidden = getHiddenProjectIds();
  const customMap = new Map<string, VideoProject>();
  for (const item of customList) {
    if (!hidden.has(item.id)) {
      customMap.set(item.id, item);
    }
  }

  const result: VideoProject[] = [...customMap.values()];
  for (const def of defaults) {
    if (!customMap.has(def.id) && !hidden.has(def.id)) {
      result.push(def);
    }
  }
  return result;
}

function mergeGraphics(customList: GraphicProject[], defaults: GraphicProject[]): GraphicProject[] {
  const hidden = getHiddenProjectIds();
  const customMap = new Map<string, GraphicProject>();
  for (const item of customList) {
    if (!hidden.has(item.id)) {
      customMap.set(item.id, item);
    }
  }

  const result: GraphicProject[] = [...customMap.values()];
  for (const def of defaults) {
    if (!customMap.has(def.id) && !hidden.has(def.id)) {
      result.push(def);
    }
  }
  return result;
}

export interface NewShowreelInput {
  title: string;
  youtubeUrl: string;
  category: VideoCategory;
  categoryLabel?: string;
  client?: string;
  duration?: string;
  description?: string;
  role?: string;
  tags?: string[];
  thumbnailUrl?: string;
}

export interface NewGraphicInput {
  title: string;
  category: GraphicCategory;
  categoryLabel?: string;
  client?: string;
  description?: string;
  aspect?: 'portrait' | 'landscape' | 'square';
  tools?: string[];
  file?: File | null;
  imageUrl?: string;
}

function isLegacyDummyItem(item: { title?: string }): boolean {
  if (!item || !item.title) return false;
  const t = item.title.toUpperCase();
  return (
    t.includes('HYPERION') ||
    t.includes('ECLIPSE PROTOCOL') ||
    t.includes('SILENT EXPEDITION') ||
    t.includes('NEO-SHIBUYA') ||
    t.includes('CHRONO DRIFT')
  );
}

let authoritativeShowreels: VideoProject[] | null = null;
let authoritativeGraphics: GraphicProject[] | null = null;

function upgradeVideoThumbnails(items: VideoProject[]): VideoProject[] {
  return items.map((item) => {
    let thumb = item.thumbnailUrl;
    const yId =
      item.youtubeId ||
      extractYouTubeId(item.embedUrl || '') ||
      extractYouTubeId((item as any).youtubeUrl || '') ||
      extractYouTubeId(thumb || '');

    if (yId) {
      thumb = getYouTubeThumbnailUrl(yId, 'maxres');
    } else if (thumb) {
      thumb = upgradeYouTubeThumbnailUrl(thumb);
    }

    if (thumb !== item.thumbnailUrl) {
      return { ...item, thumbnailUrl: thumb };
    }
    return item;
  });
}

export function getAuthoritativeShowreels(): VideoProject[] {
  if (authoritativeShowreels && authoritativeShowreels.length > 0) {
    const clean = authoritativeShowreels.filter((s) => !isLegacyDummyItem(s));
    if (clean.length > 0) return upgradeVideoThumbnails(clean);
  }

  // 1. Prioritize custom showreels from user / admin edits
  const local = getLocalShowreels().filter((s) => !isLegacyDummyItem(s));
  if (local && local.length > 0) {
    const upgraded = upgradeVideoThumbnails(local);
    authoritativeShowreels = upgraded;
    return upgraded;
  }

  // 2. Published payload from GitHub / Admin publish
  try {
    const pushedRaw = localStorage.getItem('zolepto_last_pushed_payload');
    if (pushedRaw) {
      const parsed = JSON.parse(pushedRaw);
      if (Array.isArray(parsed.showreels)) {
        const clean = parsed.showreels.filter((s: any) => !isLegacyDummyItem(s));
        if (clean.length > 0) {
          const upgraded = upgradeVideoThumbnails(clean);
          authoritativeShowreels = upgraded;
          return upgraded;
        }
      }
    }
  } catch {}

  // 3. Fallback only if virgin session with zero edits/pushes
  return upgradeVideoThumbnails(DEFAULT_VIDEOS);
}

export function getAuthoritativeGraphics(): GraphicProject[] {
  if (authoritativeGraphics && authoritativeGraphics.length > 0) {
    const clean = authoritativeGraphics.filter((g) => !isLegacyDummyItem(g));
    if (clean.length > 0) return clean;
  }

  // 1. Prioritize custom graphics from user / admin edits
  const local = getLocalGraphics().filter((g) => !isLegacyDummyItem(g));
  if (local && local.length > 0) {
    authoritativeGraphics = local;
    return local;
  }

  // 2. Published payload
  try {
    const pushedRaw = localStorage.getItem('zolepto_last_pushed_payload');
    if (pushedRaw) {
      const parsed = JSON.parse(pushedRaw);
      if (Array.isArray(parsed.graphics)) {
        const clean = parsed.graphics.filter((g: any) => !isLegacyDummyItem(g));
        if (clean.length > 0) {
          authoritativeGraphics = clean;
          return clean;
        }
      }
    }
  } catch {}

  // 3. Fallback only if virgin session
  return DEFAULT_GRAPHICS;
}

export function getLocalShowreels(): VideoProject[] {
  try {
    const raw = localStorage.getItem(LOCAL_SHOWREELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalShowreels(items: VideoProject[], dispatch = true) {
  try {
    authoritativeShowreels = items;
    localStorage.setItem(LOCAL_SHOWREELS_KEY, JSON.stringify(items));
    localStorage.setItem('zolepto_portfolio_last_edit_time', Date.now().toString());

    let fullPayload: any = null;
    try {
      const existingRaw = localStorage.getItem('zolepto_last_pushed_payload');
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      fullPayload = {
        ...existing,
        siteSettings: existing.siteSettings || getLocalSettings(),
        showreels: items,
        graphics: existing.graphics || getLocalGraphics(),
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('zolepto_last_pushed_payload', JSON.stringify(fullPayload));
    } catch {}

    if (dispatch) {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent(PORTFOLIO_EVENT));
    }

    // Seamless background global cloud sync so KVDB immediately reflects user's edits
    if (fullPayload) {
      publishToGlobalCloud(fullPayload).catch(() => {});
    }
  } catch (err) {
    console.warn('Failed to save to local storage', err);
  }
}

export function getLocalGraphics(): GraphicProject[] {
  try {
    const raw = localStorage.getItem(LOCAL_GRAPHICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalGraphics(items: GraphicProject[], dispatch = true) {
  try {
    authoritativeGraphics = items;
    localStorage.setItem(LOCAL_GRAPHICS_KEY, JSON.stringify(items));
    localStorage.setItem('zolepto_portfolio_last_edit_time', Date.now().toString());

    let fullPayload: any = null;
    try {
      const existingRaw = localStorage.getItem('zolepto_last_pushed_payload');
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      fullPayload = {
        ...existing,
        siteSettings: existing.siteSettings || getLocalSettings(),
        showreels: existing.showreels || getLocalShowreels(),
        graphics: items,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('zolepto_last_pushed_payload', JSON.stringify(fullPayload));
    } catch {}

    if (dispatch) {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent(PORTFOLIO_EVENT));
    }

    // Seamless background global cloud sync so KVDB immediately reflects user's edits
    if (fullPayload) {
      publishToGlobalCloud(fullPayload).catch(() => {});
    }
  } catch (err) {
    console.warn('Failed to save to local storage', err);
  }
}

/**
 * Reorders projects within a specific category subset of showreels (e.g. horizontal videos or vertical shorts)
 * while strictly preserving all other items in their existing relative positions.
 */
export function reorderCategoryInVideos(
  fullList: VideoProject[],
  isTargetPredicate: (item: VideoProject) => boolean,
  fromId: string,
  toId: string
): VideoProject[] {
  const matching = fullList.filter(isTargetPredicate);
  const fromIndex = matching.findIndex((m) => m.id === fromId);
  const toIndex = matching.findIndex((m) => m.id === toId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return fullList;

  const [moved] = matching.splice(fromIndex, 1);
  matching.splice(toIndex, 0, moved);

  let matchingPtr = 0;
  const updated = fullList.map((item) => {
    if (isTargetPredicate(item)) {
      return matching[matchingPtr++];
    }
    return item;
  });

  saveLocalShowreels(updated);
  return updated;
}

/**
 * Reorders graphics projects list and persists the result.
 */
export function reorderGraphicsList(
  list: GraphicProject[],
  fromId: string,
  toId: string
): GraphicProject[] {
  const fromIndex = list.findIndex((i) => i.id === fromId);
  const toIndex = list.findIndex((i) => i.id === toId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return list;

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  saveLocalGraphics(next);
  return next;
}

/**
 * Subscribes to real-time Showreels list with authoritative global synchronization.
 */
export function subscribeToShowreels(callback: (projects: VideoProject[]) => void): () => void {
  // Instant initial data: Guaranteed to be authoritative (never reverts or flickers default placeholders)
  callback(getAuthoritativeShowreels());

  let isCleanedUp = false;

  const fetchGlobalShowreels = () => {
    // If admin is active, do not overwrite with remote placeholders
    if (typeof window !== 'undefined') {
      const isCurrentlyAdmin =
        window.location.hash.toLowerCase().includes('admin') ||
        window.location.pathname.toLowerCase().includes('admin') ||
        Boolean(localStorage.getItem('zolepto_admin_editing_active'));
      if (isCurrentlyAdmin) return;
    }

    loadLivePortfolioContent()
      .then((deployed) => {
        if (isCleanedUp || !deployed || !deployed.showreels || deployed.showreels.length === 0) return;

        // Check if user has made local edits that are newer
        try {
          const lastLocalEdit = parseInt(
            localStorage.getItem('zolepto_portfolio_last_edit_time') || '0',
            10
          );
          const remoteTime = deployed.lastUpdated ? new Date(deployed.lastUpdated).getTime() : 0;
          if (lastLocalEdit > 0 && remoteTime <= lastLocalEdit) {
            return;
          }
        } catch {}

        authoritativeShowreels = deployed.showreels;
        callback(deployed.showreels);
      })
      .catch(() => {});
  };

  fetchGlobalShowreels();

  // Re-check on focus or tab active
  const handleFocus = () => fetchGlobalShowreels();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') fetchGlobalShowreels();
  };

  const handleUpdate = () => {
    if (isCleanedUp) return;
    callback(getAuthoritativeShowreels());
  };

  window.addEventListener('storage', handleUpdate);
  window.addEventListener(PORTFOLIO_EVENT, handleUpdate);
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    isCleanedUp = true;
    window.removeEventListener('storage', handleUpdate);
    window.removeEventListener(PORTFOLIO_EVENT, handleUpdate);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}

/**
 * Subscribes to real-time Graphic Design list with authoritative global synchronization.
 */
export function subscribeToGraphics(callback: (projects: GraphicProject[]) => void): () => void {
  // Instant initial data: Guaranteed to be authoritative
  callback(getAuthoritativeGraphics());

  let isCleanedUp = false;

  const fetchGlobalGraphics = () => {
    // If admin is active, do not overwrite with remote placeholders
    if (typeof window !== 'undefined') {
      const isCurrentlyAdmin =
        window.location.hash.toLowerCase().includes('admin') ||
        window.location.pathname.toLowerCase().includes('admin') ||
        Boolean(localStorage.getItem('zolepto_admin_editing_active'));
      if (isCurrentlyAdmin) return;
    }

    loadLivePortfolioContent()
      .then((deployed) => {
        if (isCleanedUp || !deployed || !deployed.graphics || deployed.graphics.length === 0) return;

        // Check if user has made local edits that are newer
        try {
          const lastLocalEdit = parseInt(
            localStorage.getItem('zolepto_portfolio_last_edit_time') || '0',
            10
          );
          const remoteTime = deployed.lastUpdated ? new Date(deployed.lastUpdated).getTime() : 0;
          if (lastLocalEdit > 0 && remoteTime <= lastLocalEdit) {
            return;
          }
        } catch {}

        authoritativeGraphics = deployed.graphics;
        callback(deployed.graphics);
      })
      .catch(() => {});
  };

  fetchGlobalGraphics();

  const handleFocus = () => fetchGlobalGraphics();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') fetchGlobalGraphics();
  };

  const handleUpdate = () => {
    if (isCleanedUp) return;
    callback(getAuthoritativeGraphics());
  };

  window.addEventListener('storage', handleUpdate);
  window.addEventListener(PORTFOLIO_EVENT, handleUpdate);
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    isCleanedUp = true;
    window.removeEventListener('storage', handleUpdate);
    window.removeEventListener(PORTFOLIO_EVENT, handleUpdate);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}

export interface PortfolioOperationResult {
  id: string;
  isCloudSynced: boolean;
  cloudError?: string;
}

/**
 * Adds a new video or short showreel to the portfolio.
 * Supports YouTube, YouTube Shorts, Instagram Reels, TikTok, and Facebook Reels.
 */
export async function addShowreel(input: NewShowreelInput): Promise<PortfolioOperationResult> {
  const url = input.youtubeUrl.trim();
  const parsed = parseVideoUrl(url);

  if (!parsed.embedUrl && !parsed.videoId) {
    throw new Error(
      'Please enter a valid video link (YouTube, Shorts, IG Reels, TikTok, or FB Reels)'
    );
  }

  const isShort = parsed.isShortForm || input.category === 'short-form';
  const category: VideoCategory = isShort && (!input.category || input.category === 'commercial')
    ? 'short-form'
    : (input.category || 'commercial');
  const categoryLabel = input.categoryLabel?.trim() || (isShort ? 'Short-Form' : category.toUpperCase());
  const aspectRatio: '16/9' | '9/16' = isShort ? '9/16' : '16/9';
  const youtubeId = parsed.videoId || '';
  const embedUrl = parsed.embedUrl;
  const rawThumb =
    input.thumbnailUrl?.trim() ||
    (youtubeId ? getYouTubeThumbnailUrl(youtubeId, 'maxres') : parsed.thumbnailUrl) ||
    (isShort
      ? createShortsPlaceholderSvg(input.title, parsed.platformLabel)
      : '');
  const thumbnailUrl = upgradeYouTubeThumbnailUrl(rawThumb);

  const newId = isShort ? `short-${Date.now()}` : `reel-${Date.now()}`;
  const newDoc: VideoProject = {
    id: newId,
    title: input.title.trim() || (isShort ? 'Untitled Short' : 'Untitled Showreel'),
    client: input.client?.trim() || 'Client Project',
    category,
    categoryLabel,
    duration: input.duration?.trim() || (isShort ? '0:30' : '1:00'),
    year: '2026',
    youtubeId,
    embedUrl,
    thumbnailUrl,
    aspectRatio,
    description: input.description?.trim() || '',
    role: input.role?.trim() || (isShort ? 'Retention Edit & Hook' : 'Lead Editor'),
    tags: input.tags && input.tags.length > 0
      ? input.tags
      : isShort
      ? ['Short-Form', 'Reels']
      : ['Commercial', 'Editing'],
  };

  const currentList = getAuthoritativeShowreels();
  saveLocalShowreels([newDoc, ...currentList]);

  return { id: newId, isCloudSynced: true };
}

/**
 * Deletes a showreel from the portfolio.
 */
export async function deleteShowreel(id: string): Promise<void> {
  hideProjectId(id);
  const currentList = getAuthoritativeShowreels();
  const updatedList = currentList.filter((item) => item.id !== id);
  saveLocalShowreels(updatedList);
}

/**
 * Updates an existing showreel in the portfolio.
 */
export async function updateShowreel(
  id: string,
  updates: Partial<VideoProject> & { youtubeUrl?: string }
): Promise<PortfolioOperationResult> {
  const currentList = getAuthoritativeShowreels();
  const index = currentList.findIndex((p) => p.id === id);
  const target = index !== -1 ? currentList[index] : {
    id,
    title: 'Showreel',
    client: 'Client Project',
    category: 'commercial' as VideoCategory,
    categoryLabel: 'Showreel',
    duration: '1:00',
    year: '2026',
    youtubeId: '',
    embedUrl: '',
    thumbnailUrl: '',
    description: '',
    role: 'Lead Editor',
    tags: ['Editing'],
  };

  let youtubeId = target.youtubeId;
  let embedUrl = target.embedUrl;
  let thumbnailUrl = upgradeYouTubeThumbnailUrl(target.thumbnailUrl);
  let aspectRatio: '16/9' | '9/16' = target.aspectRatio || '16/9';
  let category: VideoCategory = target.category;

  if (updates.thumbnailUrl && updates.thumbnailUrl.trim()) {
    thumbnailUrl = upgradeYouTubeThumbnailUrl(updates.thumbnailUrl.trim());
  }

  if (updates.youtubeUrl && updates.youtubeUrl.trim()) {
    const parsed = parseVideoUrl(updates.youtubeUrl.trim());
    if (parsed.embedUrl || parsed.videoId) {
      youtubeId = parsed.videoId || '';
      embedUrl = parsed.embedUrl;
      const isShort = parsed.isShortForm || updates.category === 'short-form';
      aspectRatio = isShort ? '9/16' : '16/9';
      if (isShort && (!updates.category || updates.category === 'commercial')) {
        category = 'short-form';
      }
      if (!updates.thumbnailUrl || !updates.thumbnailUrl.trim()) {
        const rawT =
          (youtubeId ? getYouTubeThumbnailUrl(youtubeId, 'maxres') : parsed.thumbnailUrl) ||
          (isShort
            ? createShortsPlaceholderSvg(updates.title || target.title, parsed.platformLabel)
            : target.thumbnailUrl);
        thumbnailUrl = upgradeYouTubeThumbnailUrl(rawT);
      }
    }
  }

  const updatedDoc: VideoProject = {
    ...target,
    ...updates,
    category: updates.category || category,
    aspectRatio: updates.aspectRatio || aspectRatio,
    youtubeId,
    embedUrl,
    thumbnailUrl,
    tags: updates.tags || target.tags,
  };

  if (isShortFormVideo(updatedDoc)) {
    updatedDoc.aspectRatio = '9/16';
  }

  let updatedList: VideoProject[];
  if (index !== -1) {
    updatedList = [...currentList];
    updatedList[index] = updatedDoc;
  } else {
    updatedList = [updatedDoc, ...currentList];
  }

  saveLocalShowreels(updatedList);

  return { id, isCloudSynced: true };
}

/**
 * Adds a graphic design image to the portfolio.
 */
export async function addGraphicDesign(input: NewGraphicInput): Promise<PortfolioOperationResult> {
  let finalImageUrl = input.imageUrl || '';

  if (input.file) {
    finalImageUrl = await readFileAsDataUrl(input.file);
  }

  if (!finalImageUrl) {
    throw new Error('Please choose an image file to upload or provide an image URL');
  }

  const newId = `graphic-${Date.now()}`;
  const newDoc: GraphicProject = {
    id: newId,
    title: input.title.trim() || 'Untitled Design',
    client: input.client?.trim() || 'Original Art',
    category: input.category || 'key-art',
    categoryLabel: input.categoryLabel || input.category.toUpperCase(),
    imageUrl: finalImageUrl,
    aspect: input.aspect || 'portrait',
    year: '2026',
    description: input.description?.trim() || '',
    tools: input.tools && input.tools.length > 0 ? input.tools : ['Photoshop'],
  };

  const currentList = getAuthoritativeGraphics();
  saveLocalGraphics([newDoc, ...currentList]);

  return {
    id: newId,
    isCloudSynced: true,
  };
}

/**
 * Deletes a graphic design item from the portfolio.
 */
export async function deleteGraphicDesign(id: string, _imageUrl?: string): Promise<void> {
  hideProjectId(id);
  const currentList = getAuthoritativeGraphics();
  const updatedList = currentList.filter((item) => item.id !== id);
  saveLocalGraphics(updatedList);
}

/**
 * Updates an existing graphic design item in the portfolio.
 */
export async function updateGraphicDesign(
  id: string,
  updates: Partial<GraphicProject> & { file?: File | null }
): Promise<PortfolioOperationResult> {
  const currentList = getAuthoritativeGraphics();
  const index = currentList.findIndex((p) => p.id === id);
  const target = index !== -1 ? currentList[index] : {
    id,
    title: 'Design Project',
    client: 'Studio Art',
    category: 'key-art' as GraphicCategory,
    categoryLabel: 'Key Art',
    imageUrl: '',
    aspect: 'portrait' as const,
    year: '2026',
    description: '',
    tools: ['Photoshop'],
  };

  let finalImageUrl = updates.imageUrl || target.imageUrl;

  if (updates.file) {
    finalImageUrl = await readFileAsDataUrl(updates.file);
  }

  const updatedDoc: GraphicProject = {
    ...target,
    ...updates,
    imageUrl: finalImageUrl,
    tools: updates.tools || target.tools,
  };

  let updatedList: GraphicProject[];
  if (index !== -1) {
    updatedList = [...currentList];
    updatedList[index] = updatedDoc;
  } else {
    updatedList = [updatedDoc, ...currentList];
  }

  saveLocalGraphics(updatedList);

  return { id, isCloudSynced: true };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
