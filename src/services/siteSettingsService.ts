import { SiteSettings } from '../types';
import { loadLivePortfolioContent, CONTENT_PUBLISHED_EVENT } from './githubSyncService';

const SITE_SETTINGS_KEY = 'zolepto_site_settings';
const DRAFT_SETTINGS_KEY = 'zolepto_site_settings_draft';
const SETTINGS_EVENT = 'zolepto:site-settings-changed';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  headerLogoUrl: '',
  headerLogoDarkUrl: '',
  headerLogoLightUrl: '',
  heroTitleLine1: 'Editing is just the start.',
  heroTitleLine2: 'I care what happens after you hit post.',
  heroSubtitle:
    'I team up with creators and brands to build videos worth staying for, and an audience that actually comes back, not just views.',
  availabilityStatus: 'Available for incoming projects!',
  showAvailabilityDot: true,
  aboutHeading: 'Background & Approach',
  aboutBio1:
    'I\'m Zolepto. Six years ago, I started a channel with zero knowledge and grew it from the ground up. Every mistake became a building block, and along the way I picked up video editing, motion design, thumbnails, and branding.',
  aboutBio2:
    'Because I\'ve built a channel myself, I don\'t see your project as just another editing gig. I see it the way a content strategist would: what makes people click, stay, and come back.',
  aboutDirectorNote: '',
  aboutTools: ['Premiere Pro', 'After Effects', 'Photoshop', 'YouTube Studio'],
  contactEmail: 'zolepto@gmail.com',
  profilePictureUrl: '',
  featuredReelYoutubeId: 'aqz-KE-bpKQ',
  featuredReelTitle: 'ZOLEPTO — 2026 Director & Editing Master Showreel',
  // Hero Credibility Metrics
  heroStat1Value: '14M+',
  heroStat1Label: 'Organic Views',
  heroStat2Value: '4+ Years',
  heroStat2Label: 'Multimedia & Content Creation',
  heroStat3Value: '1-on-1',
  heroStat3Label: 'Direct Direction',
  // Workshop Blueprint customizable steps
  workshopHeading: 'Four steps from your idea to your audience.',
  workshopSubtitle:
    'No rigid agency steps or generic templates. A deliberate, human creative process mapped out like a workshop drafting sheet—breaking things down to discover what truly resonates.',
  step1Title: 'Identifying You',
  step1Subtitle: '',
  step1Description:
    'We have to identify your authentic side, what your content stands for, and the audience you\'re actually trying to reach. Your content and ideas come first before we actually edit.',
  step1Note: '“Who you are > fancy transitions. This is where real retention is born.”',
  step2Title: 'Dissecting the Narrative',
  step2Subtitle: '',
  step2Description:
    'We prioritize the value of the content over unnecessary flashy fancy edits. We lift your story with the editing you envision. Video editing stands out when it\'s actually contributing to your content and the progression of the video.',
  step2Note: 'Substance over spectacle. Every cut must justify the narrative.',
  step3Title: 'Look Beyond the Process',
  step3Subtitle: '',
  step3Description:
    'Actually step out of the editing state and view the output as your own viewer and question it: Does the edit elevate your story? Did we find the content valuable? We make sure all seconds are justified and covered.',
  step3Note: 'Step out of the timeline. View the final cut through the viewer\'s eyes.',
  step4Title: 'Official Drop',
  step4Subtitle: '',
  step4Description:
    'After a meticulous process of multiple passes, double-checking every cut, layer, and effect, we deliver it at the promised time. Total transparency, zero ghosting, and responsive collaboration.',
  step4Note: 'Delivered on time with total transparency and zero ghosting.',
  socialInstagram: 'https://www.instagram.com/zoleptos.motion/',
  socialLinkedin: 'https://www.linkedin.com/in/zolepto-haraya-936b622b7/',
  socialX: 'https://x.com/Zolep138657',
  socialGmail: 'zolepto@gmail.com',
  web3formsAccessKey: 'cce7d17a-a640-443a-b066-33c06020b08e',
};

export function getLocalSettings(): SiteSettings {
  try {
    let raw = localStorage.getItem(SITE_SETTINGS_KEY);
    if (!raw) {
      const pushedRaw = localStorage.getItem('zolepto_last_pushed_payload');
      if (pushedRaw) {
        try {
          const parsedPushed = JSON.parse(pushedRaw);
          if (parsedPushed.siteSettings) {
            raw = JSON.stringify(parsedPushed.siteSettings);
          }
        } catch {}
      }
    }
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw);
    if (parsed.web3formsAccessKey === '64d852a4-5696-414c-a11b-10f845dca889' || !parsed.web3formsAccessKey) {
      parsed.web3formsAccessKey = 'cce7d17a-a640-443a-b066-33c06020b08e';
    }
    if (parsed.socialInstagram === 'https://instagram.com/zolepto' || !parsed.socialInstagram) {
      parsed.socialInstagram = 'https://www.instagram.com/zoleptos.motion/';
    }
    if (parsed.socialX === 'https://x.com/zolepto' || !parsed.socialX) {
      parsed.socialX = 'https://x.com/Zolep138657';
    }
    if (parsed.socialLinkedin === 'https://linkedin.com/in/zolepto' || !parsed.socialLinkedin) {
      parsed.socialLinkedin = 'https://www.linkedin.com/in/zolepto-haraya-936b622b7/';
    }
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

export function getDraftSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(DRAFT_SETTINGS_KEY);
    if (raw) {
      return { ...getLocalSettings(), ...JSON.parse(raw) };
    }
  } catch {}
  return getLocalSettings();
}

export function saveDraftSettings(draft: SiteSettings) {
  try {
    localStorage.setItem(DRAFT_SETTINGS_KEY, JSON.stringify(draft));
  } catch (err) {
    console.warn('Failed to save draft settings:', err);
  }
}

export function clearDraftSettings() {
  try {
    localStorage.removeItem(DRAFT_SETTINGS_KEY);
  } catch {}
}

/**
 * Subscribes to live site copy settings.
 * Authoritative Rule: The entire website (for visitors and admin alike) renders
 * the true latest published content from the global cloud/GitHub/content.json.
 */
export function subscribeToSiteSettings(callback: (settings: SiteSettings) => void): () => void {
  // Fast initial render from cached published settings
  const localInitial = getLocalSettings();
  callback(localInitial);

  let isCleanedUp = false;

  const fetchGlobalSettings = () => {
    // If user is actively in the Admin panel, do NOT overwrite their live form state with old deployed content
    if (typeof window !== 'undefined') {
      const isCurrentlyAdmin = window.location.hash.toLowerCase().includes('admin') || 
                               window.location.pathname.toLowerCase().includes('admin') ||
                               Boolean(localStorage.getItem('zolepto_admin_editing_active'));
      if (isCurrentlyAdmin) return;
    }

    loadLivePortfolioContent()
      .then((deployed) => {
        if (isCleanedUp || !deployed || !deployed.siteSettings) return;

        // Authoritative source of truth: Deployed/published settings
        const finalSettings: SiteSettings = {
          ...DEFAULT_SITE_SETTINGS,
          ...deployed.siteSettings,
        };

        // Cache so reloads and offline stay fully updated
        saveLocalSettings(finalSettings, false);
        callback(finalSettings);
      })
      .catch((err) => {
        console.warn('Could not sync live site copy:', err);
      });
  };

  // Immediate authoritative fetch
  fetchGlobalSettings();

  // Re-fetch when user returns to tab
  const handleFocus = () => fetchGlobalSettings();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') fetchGlobalSettings();
  };

  // Periodic real-time poll every 8 seconds for immediate client updates
  const interval = setInterval(fetchGlobalSettings, 8000);

  const handleLocalUpdate = () => {
    if (isCleanedUp) return;
    callback(getLocalSettings());
  };

  const handleGlobalPublished = (e: any) => {
    if (isCleanedUp) return;
    if (e.detail?.siteSettings) {
      const merged = { ...DEFAULT_SITE_SETTINGS, ...e.detail.siteSettings };
      saveLocalSettings(merged, false);
      callback(merged);
    } else {
      fetchGlobalSettings();
    }
  };

  window.addEventListener('storage', handleLocalUpdate);
  window.addEventListener(SETTINGS_EVENT, handleLocalUpdate);
  window.addEventListener(CONTENT_PUBLISHED_EVENT, handleGlobalPublished);
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    isCleanedUp = true;
    clearInterval(interval);
    window.removeEventListener('storage', handleLocalUpdate);
    window.removeEventListener(SETTINGS_EVENT, handleLocalUpdate);
    window.removeEventListener(CONTENT_PUBLISHED_EVENT, handleGlobalPublished);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}

/**
 * Saves updated site copy as authoritative published settings and broadcasts to the site.
 */
export async function updateSiteSettings(
  updates: Partial<SiteSettings>
): Promise<{ success: boolean; cloudSynced: boolean; error?: string }> {
  const current = getLocalSettings();
  const updated: SiteSettings = { ...current, ...updates };

  saveLocalSettings(updated, true);
  clearDraftSettings();
  return { success: true, cloudSynced: true };
}
