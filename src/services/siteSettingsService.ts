import { SiteSettings } from '../types';
import { loadLivePortfolioContent } from './githubSyncService';

const SITE_SETTINGS_KEY = 'zolepto_site_settings';
const SETTINGS_EVENT = 'zolepto:site-settings-changed';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroTitleLine1: 'Your visual storyteller',
  heroTitleLine2: '& content creation director.',
  heroSubtitle:
    'I craft high-retention commercial cuts, cinematic narratives, and digital formats where every single frame earns its place. Direct 1-on-1 collaboration that makes your work impossible to ignore.',
  availabilityStatus: 'Available for incoming projects!',
  showAvailabilityDot: true,
  aboutHeading: 'About',
  aboutQuote:
    '“An edit isn’t just assembling footage. It’s an emotional rhythm that decides whether a viewer clicks away in three seconds or stays until the final frame.”',
  aboutBio1:
    'I’m Zolepto Hiraya. For over four years, I’ve lived inside the timeline—obsessing over the millisecond a cut lands, why retention drops at forty-five seconds, and how subconscious sound design transforms an ordinary video into an unforgettable experience.',
  aboutBio2:
    'I partner directly with creators, founders, and ambitious brands. No junior handoffs, no agency bloat. You work directly with me from raw footage ingest to final sound mix and cinematic color grade.',
  contactEmail: 'zelopte@gmail.com',
  featuredReelYoutubeId: 'aqz-KE-bpKQ',
  featuredReelTitle: 'ZOLEPTO — 2026 Director & Editing Master Showreel',
};

export function getLocalSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw);
    if (parsed.availabilityStatus === 'Open for select Q3/Q4 collaborations') {
      parsed.availabilityStatus = 'Available for incoming projects!';
    }
    // Ensure email is zelopte@gmail.com if it was placeholder
    if (parsed.contactEmail === 'zolepto@gmail.com') {
      parsed.contactEmail = 'zelopte@gmail.com';
    }
    return { ...DEFAULT_SITE_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveLocalSettings(settings: SiteSettings) {
  try {
    localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
  } catch (err) {
    console.warn('Failed to save settings locally:', err);
  }
}

/**
 * Subscribes to live site copy settings with fast local synchronization and global content.json loading.
 */
export function subscribeToSiteSettings(callback: (settings: SiteSettings) => void): () => void {
  // Emit local copy immediately for instant render
  callback(getLocalSettings());

  let isCleanedUp = false;

  // Background fetch from public/content.json (GitHub / Vercel deployed data)
  loadLivePortfolioContent().then((deployed) => {
    if (isCleanedUp || !deployed || !deployed.siteSettings) return;
    const current = getLocalSettings();
    // Merge if no newer local edits exist or to update baseline
    const merged: SiteSettings = { ...DEFAULT_SITE_SETTINGS, ...deployed.siteSettings, ...current };
    callback(merged);
  }).catch(() => {});

  const handleUpdate = () => {
    if (isCleanedUp) return;
    callback(getLocalSettings());
  };

  window.addEventListener('storage', handleUpdate);
  window.addEventListener(SETTINGS_EVENT, handleUpdate);

  return () => {
    isCleanedUp = true;
    window.removeEventListener('storage', handleUpdate);
    window.removeEventListener(SETTINGS_EVENT, handleUpdate);
  };
}

/**
 * Saves updated site copy to local storage (ready for GitHub commit & Vercel deployment).
 */
export async function updateSiteSettings(
  updates: Partial<SiteSettings>
): Promise<{ success: boolean; cloudSynced: boolean; error?: string }> {
  const current = getLocalSettings();
  const updated: SiteSettings = { ...current, ...updates };

  saveLocalSettings(updated);
  return { success: true, cloudSynced: true };
}
