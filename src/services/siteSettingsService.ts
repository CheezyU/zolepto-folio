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
  // Workshop Blueprint customizable steps
  workshopHeading: 'How the story unfolds.',
  workshopSubtitle:
    'No rigid agency steps or generic templates. A deliberate, human creative process mapped out like a workshop drafting sheet—breaking things down to discover what truly resonates.',
  step1Title: 'Identifying You',
  step1Subtitle: 'The Core Signal & Creative DNA',
  step1Description:
    'Before a single clip is dragged to the timeline or a cut is made, we identify you. Who you are, what your voice stands for, who your real audience is, and the psychological hook that makes your content undeniably yours. We don’t copy trends or use cookie-cutter templates—we locate your authentic edge and reverse-engineer the entire narrative around it.',
  step1Note: '“Who you are > fancy transitions. This is where real retention is born.”',
  step2Title: 'Deconstructing the Narrative',
  step2Subtitle: 'Ruthless Dissection & Trimming the Fat',
  step2Description:
    'Every raw timeline is bloated with comfort footage and dead air. We break your narrative down to its absolute bare skeleton. Dissecting the raw rushes, unearthing unexpected gold in second takes, and mapping out the viewer retention curve. Every single second on the timeline must justify its existence or get cut. It’s an intentional, honest breakdown until only pure substance remains.',
  step2Note: '✂ Cut the safety filler. If it doesn’t push the story forward, it dies here.',
  step3Title: 'Emotional Rhythm & Subconscious Sound',
  step3Subtitle: 'The Kinetic Pulse & Visceral Foley',
  step3Description:
    'Pacing isn’t raw speed—it’s tension, breath, and release. We sculpt the cut to an auditory heartbeat: layering subconscious micro-risers, tactile foley, deep sub-bass drops, and room ambience that viewers feel in their chest before their eyes even register it. Audio carries 70% of cinematic perception; we treat sound as equal to the picture.',
  step3Note: 'Subconscious audio cues [40Hz - 12kHz] — feel it in the headphones 🎧',
  step4Title: 'Visual Prestige & Delivery',
  step4Subtitle: 'Color Science, Key-Art & Cultural Authority',
  step4Description:
    'The final synthesis. Film-grade DaVinci color science with custom highlight rolloff, skin-tone preservation, kinetic typography, and high-CTR thumbnail packaging that stops the infinite scroll. When we export, your project looks and sounds like a studio production that commands immediate respect and builds long-term authority.',
  step4Note: '✦ Ready for export. Approved for master release across all formats.',
  socialInstagram: 'https://instagram.com/zolepto',
  socialLinkedin: 'https://linkedin.com/in/zolepto',
  socialX: 'https://x.com/zolepto',
  socialGmail: 'cheddarc19@gmail.com',
  formsubmitEmail: 'cheddarc19@gmail.com',
};

export function getLocalSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SITE_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveLocalSettings(settings: SiteSettings, dispatch = true) {
  try {
    localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
    if (dispatch) {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
    }
  } catch (err) {
    console.warn('Failed to save settings locally:', err);
  }
}

/**
 * Subscribes to live site copy settings with fast local initialization and global content.json synchronization.
 * Crucial Fix: Deployed settings from content.json / GitHub take authoritative priority for clients!
 */
export function subscribeToSiteSettings(callback: (settings: SiteSettings) => void): () => void {
  // Fast initial render from cached local settings
  const localInitial = getLocalSettings();
  callback(localInitial);

  let isCleanedUp = false;

  const fetchGlobalSettings = () => {
    loadLivePortfolioContent()
      .then((deployed) => {
        if (isCleanedUp || !deployed || !deployed.siteSettings) return;

        // Determine if local admin has active unsaved draft session
        const hasAdminSession = Boolean(localStorage.getItem('zolepto_admin_session'));

        let finalSettings: SiteSettings;
        if (hasAdminSession) {
          // In admin mode, keep local edits but backfill missing keys from deployed
          const currentLocal = getLocalSettings();
          finalSettings = {
            ...DEFAULT_SITE_SETTINGS,
            ...deployed.siteSettings,
            ...currentLocal,
          };
        } else {
          // For all public visitors and clients: Deployed content from GitHub/Vercel is the true reality!
          finalSettings = {
            ...DEFAULT_SITE_SETTINGS,
            ...deployed.siteSettings,
          };
          // Persist to local cache so offline or reloads stay up to date
          saveLocalSettings(finalSettings, false);
        }

        callback(finalSettings);
      })
      .catch((err) => {
        console.warn('Could not sync live site copy:', err);
      });
  };

  // Immediate fetch
  fetchGlobalSettings();

  // Re-fetch when client returns to tab or window gains focus
  const handleFocus = () => {
    fetchGlobalSettings();
  };

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      fetchGlobalSettings();
    }
  };

  // Periodic real-time poll every 10 seconds for instant live client synchronization
  const interval = setInterval(fetchGlobalSettings, 10000);

  const handleLocalUpdate = () => {
    if (isCleanedUp) return;
    callback(getLocalSettings());
  };

  window.addEventListener('storage', handleLocalUpdate);
  window.addEventListener(SETTINGS_EVENT, handleLocalUpdate);
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    isCleanedUp = true;
    clearInterval(interval);
    window.removeEventListener('storage', handleLocalUpdate);
    window.removeEventListener(SETTINGS_EVENT, handleLocalUpdate);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibility);
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

  saveLocalSettings(updated, true);
  return { success: true, cloudSynced: true };
}
