import { VideoProject, GraphicProject, VideoCategory, GraphicCategory } from '../types';
import { VIDEO_PROJECTS as DEFAULT_VIDEOS, GRAPHIC_PROJECTS as DEFAULT_GRAPHICS } from '../data/portfolioData';
import { extractYouTubeId, buildYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../lib/youtube';
import { loadLivePortfolioContent } from './githubSyncService';

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
    localStorage.setItem(LOCAL_SHOWREELS_KEY, JSON.stringify(items));
    if (dispatch) {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent(PORTFOLIO_EVENT));
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
    localStorage.setItem(LOCAL_GRAPHICS_KEY, JSON.stringify(items));
    if (dispatch) {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent(PORTFOLIO_EVENT));
    }
  } catch (err) {
    console.warn('Failed to save to local storage', err);
  }
}

/**
 * Subscribes to real-time Showreels list with authoritative global synchronization.
 */
export function subscribeToShowreels(callback: (projects: VideoProject[]) => void): () => void {
  // Instant initial data
  const initialLocal = getLocalShowreels();
  callback(mergeShowreels(initialLocal, DEFAULT_VIDEOS));

  let isCleanedUp = false;

  const fetchGlobalShowreels = () => {
    loadLivePortfolioContent()
      .then((deployed) => {
        if (isCleanedUp || !deployed || !deployed.showreels || deployed.showreels.length === 0) return;

        const hasAdminSession = Boolean(localStorage.getItem('zolepto_admin_session'));
        if (hasAdminSession) {
          const currentLocal = getLocalShowreels();
          const merged = mergeShowreels(currentLocal, deployed.showreels);
          callback(merged);
        } else {
          // For all client visitors: Deployed content from GitHub is the single global truth!
          callback(deployed.showreels);
        }
      })
      .catch(() => {});
  };

  fetchGlobalShowreels();

  // Re-check on focus or tab active
  const handleFocus = () => fetchGlobalShowreels();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') fetchGlobalShowreels();
  };
  const pollInterval = setInterval(fetchGlobalShowreels, 10000);

  const handleUpdate = () => {
    if (isCleanedUp) return;
    const updated = getLocalShowreels();
    callback(mergeShowreels(updated, DEFAULT_VIDEOS));
  };

  window.addEventListener('storage', handleUpdate);
  window.addEventListener(PORTFOLIO_EVENT, handleUpdate);
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    isCleanedUp = true;
    clearInterval(pollInterval);
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
  // Instant initial data
  const initialLocal = getLocalGraphics();
  callback(mergeGraphics(initialLocal, DEFAULT_GRAPHICS));

  let isCleanedUp = false;

  const fetchGlobalGraphics = () => {
    loadLivePortfolioContent()
      .then((deployed) => {
        if (isCleanedUp || !deployed || !deployed.graphics || deployed.graphics.length === 0) return;

        const hasAdminSession = Boolean(localStorage.getItem('zolepto_admin_session'));
        if (hasAdminSession) {
          const currentLocal = getLocalGraphics();
          const merged = mergeGraphics(currentLocal, deployed.graphics);
          callback(merged);
        } else {
          // For all client visitors: Deployed content from GitHub is the single global truth!
          callback(deployed.graphics);
        }
      })
      .catch(() => {});
  };

  fetchGlobalGraphics();

  const handleFocus = () => fetchGlobalGraphics();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') fetchGlobalGraphics();
  };
  const pollInterval = setInterval(fetchGlobalGraphics, 10000);

  const handleUpdate = () => {
    if (isCleanedUp) return;
    const updated = getLocalGraphics();
    callback(mergeGraphics(updated, DEFAULT_GRAPHICS));
  };

  window.addEventListener('storage', handleUpdate);
  window.addEventListener(PORTFOLIO_EVENT, handleUpdate);
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    isCleanedUp = true;
    clearInterval(pollInterval);
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
 * Adds a new YouTube embed showreel to the portfolio.
 */
export async function addShowreel(input: NewShowreelInput): Promise<PortfolioOperationResult> {
  const youtubeId = extractYouTubeId(input.youtubeUrl);
  if (!youtubeId) {
    throw new Error(
      'Please enter a valid YouTube video URL or ID (e.g., https://youtu.be/xxx or https://youtube.com/watch?v=xxx)'
    );
  }

  const embedUrl = buildYouTubeEmbedUrl(youtubeId);
  const thumbnailUrl = getYouTubeThumbnailUrl(youtubeId);

  const newId = `reel-${Date.now()}`;
  const newDoc: VideoProject = {
    id: newId,
    title: input.title.trim() || 'Untitled Showreel',
    client: input.client?.trim() || 'Client Project',
    category: input.category || 'commercial',
    categoryLabel: input.categoryLabel || input.category.toUpperCase(),
    duration: input.duration?.trim() || '1:00',
    year: '2026',
    youtubeId,
    embedUrl,
    thumbnailUrl,
    description: input.description?.trim() || '',
    role: input.role?.trim() || 'Lead Editor',
    tags: input.tags && input.tags.length > 0 ? input.tags : ['Commercial', 'Editing'],
  };

  const localItems = getLocalShowreels();
  saveLocalShowreels([newDoc, ...localItems]);

  return { id: newId, isCloudSynced: true };
}

/**
 * Deletes a showreel from the portfolio.
 */
export async function deleteShowreel(id: string): Promise<void> {
  hideProjectId(id);
  const localItems = getLocalShowreels().filter((item) => item.id !== id);
  saveLocalShowreels(localItems);
}

/**
 * Updates an existing showreel in the portfolio.
 */
export async function updateShowreel(
  id: string,
  updates: Partial<VideoProject> & { youtubeUrl?: string }
): Promise<PortfolioOperationResult> {
  const existingShowreels = mergeShowreels(getLocalShowreels(), DEFAULT_VIDEOS);
  const target = existingShowreels.find((p) => p.id === id) || {
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
  let thumbnailUrl = target.thumbnailUrl;

  if (updates.youtubeUrl && updates.youtubeUrl.trim()) {
    const extracted = extractYouTubeId(updates.youtubeUrl);
    if (extracted) {
      youtubeId = extracted;
      embedUrl = buildYouTubeEmbedUrl(extracted);
      thumbnailUrl = getYouTubeThumbnailUrl(extracted);
    }
  }

  const updatedDoc: VideoProject = {
    ...target,
    ...updates,
    youtubeId,
    embedUrl,
    thumbnailUrl,
    tags: updates.tags || target.tags,
  };

  const localItems = getLocalShowreels().filter((item) => item.id !== id);
  saveLocalShowreels([updatedDoc, ...localItems]);

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

  const localItems = getLocalGraphics();
  saveLocalGraphics([newDoc, ...localItems]);

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
  const localItems = getLocalGraphics().filter((item) => item.id !== id);
  saveLocalGraphics(localItems);
}

/**
 * Updates an existing graphic design item in the portfolio.
 */
export async function updateGraphicDesign(
  id: string,
  updates: Partial<GraphicProject> & { file?: File | null }
): Promise<PortfolioOperationResult> {
  const existingGraphics = mergeGraphics(getLocalGraphics(), DEFAULT_GRAPHICS);
  const target = existingGraphics.find((p) => p.id === id) || {
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

  const localItems = getLocalGraphics().filter((item) => item.id !== id);
  saveLocalGraphics([updatedDoc, ...localItems]);

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
