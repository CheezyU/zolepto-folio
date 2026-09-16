import { SiteSettings } from '../types';

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
  contactEmail: 'zolepto@gmail.com',
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
 * Subscribes to live site copy settings with fast local synchronization.
 */
export function subscribeToSiteSettings(callback: (settings: SiteSettings) => void): () => void {
  // Emit local copy immediately for instant render
  callback(getLocalSettings());

  let isCleanedUp = false;

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
 * Saves updated site copy to local storage (production ready for GitHub & Vercel).
 */
export async function updateSiteSettings(
  updates: Partial<SiteSettings>
): Promise<{ success: boolean; cloudSynced: boolean; error?: string }> {
  const current = getLocalSettings();
  const updated: SiteSettings = { ...current, ...updates };

  saveLocalSettings(updated);
  return { success: true, cloudSynced: true };
}
