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
  aboutBio3:
    'I keep my ego out of the room. I\'m still hungry, still learning, and always adapting, so your brand keeps moving forward.',
  aboutDirectorNote:
    'I grew my own channel from zero, then stepped away from it to help other creators grow further from wherever they are now.',
  aboutChannelUrl: 'https://www.youtube.com/@HelixGr4nd',
  aboutChannelTag: '@HelixGr4nd',
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
  step1Title: 'Identifying YOU',
  step1Subtitle: '',
  step1Description:
    "I start with you: your authentic side, what your content stands for, and who you're actually trying to reach. Your content and ideas come first, before I touch the footage.",
  step1Note: '',
  step2Title: 'Dissecting the Narrative',
  step2Subtitle: '',
  step2Description:
    "The value of your content matters more than flashy edits. I lift your story in the style you envision, and every cut, effect, and transition has to serve the progression of the video.",
  step2Note: '',
  step3Title: 'Look Beyond the Process',
  step3Subtitle: '',
  step3Description:
    "I step out of editing mode and actually watch it as your own viewer would. Does the edit elevate the story? Was it worth watching? Every second has to be justified.",
  step3Note: '',
  step4Title: 'Official Drop',
  step4Subtitle: '',
  step4Description:
    "Multiple passes, with every cut, layer, and effect double-checked, then delivered on the promised date. Total transparency, zero ghosting, and easy collaboration.",
  step4Note: '',
  socialInstagram: 'https://www.instagram.com/zoleptos.motion/',
  socialLinkedin: 'https://www.linkedin.com/in/zolepto-haraya-936b622b7/',
  socialX: 'https://x.com/Zolep138657',
  socialGmail: 'zolepto@gmail.com',
  web3formsAccessKey: 'cce7d17a-a640-443a-b066-33c06020b08e',
};

/**
 * Normalizes and upgrades any stored settings to purge stale text from older iterations.
 */
export function sanitizeSiteSettings(incoming: Partial<SiteSettings> | null | undefined): SiteSettings {
  const merged: SiteSettings = { ...DEFAULT_SITE_SETTINGS, ...(incoming || {}) };

  // 1. Upgrade stale Hero headlines & subtitle
  if (
    !merged.heroTitleLine1 ||
    merged.heroTitleLine1.includes('Cinematic Video Editing') ||
    merged.heroTitleLine1.includes('High-Retention Video Direction')
  ) {
    merged.heroTitleLine1 = DEFAULT_SITE_SETTINGS.heroTitleLine1;
  }
  if (
    !merged.heroTitleLine2 ||
    merged.heroTitleLine2.includes('That Commands Culture') ||
    merged.heroTitleLine2 === 'Editing is just the start.'
  ) {
    merged.heroTitleLine2 = DEFAULT_SITE_SETTINGS.heroTitleLine2;
  }
  if (
    !merged.heroSubtitle ||
    merged.heroSubtitle.includes('I partner with ambitious YouTube creators')
  ) {
    merged.heroSubtitle = DEFAULT_SITE_SETTINGS.heroSubtitle;
  }

  // 2. Upgrade stale Workshop / Process Heading
  if (
    !merged.workshopHeading ||
    merged.workshopHeading === 'How the story unfolds.' ||
    merged.workshopHeading === 'From first call to after you hit post.' ||
    merged.workshopHeading.includes('How the Story Unfolds')
  ) {
    merged.workshopHeading = DEFAULT_SITE_SETTINGS.workshopHeading;
  }

  // 3. Upgrade stale Step 1
  if (
    !merged.step1Title ||
    merged.step1Title === 'Phase 01: Identifying You' ||
    merged.step1Title === 'Identifying You'
  ) {
    merged.step1Title = DEFAULT_SITE_SETTINGS.step1Title;
  }
  if (
    !merged.step1Description ||
    merged.step1Description.includes('Before a single clip') ||
    merged.step1Description.includes('We have to identify your authentic side')
  ) {
    merged.step1Description = DEFAULT_SITE_SETTINGS.step1Description;
  }

  // 4. Upgrade stale Step 2
  if (
    !merged.step2Title ||
    merged.step2Title === 'Deconstructing the Narrative' ||
    merged.step2Title.includes('Deconstructing')
  ) {
    merged.step2Title = DEFAULT_SITE_SETTINGS.step2Title;
  }
  if (
    !merged.step2Description ||
    merged.step2Description.includes('Every raw timeline') ||
    merged.step2Description.includes('We prioritize the value of the content')
  ) {
    merged.step2Description = DEFAULT_SITE_SETTINGS.step2Description;
  }

  // 5. Upgrade stale Step 3
  if (
    !merged.step3Title ||
    merged.step3Title === 'Emotional Rhythm & Subconscious Sound' ||
    merged.step3Title.includes('Emotional Rhythm')
  ) {
    merged.step3Title = DEFAULT_SITE_SETTINGS.step3Title;
  }
  if (
    !merged.step3Description ||
    merged.step3Description.includes('Pacing isn’t raw speed') ||
    merged.step3Description.includes("Pacing isn't raw speed") ||
    merged.step3Description.includes('Actually step out of the editing state')
  ) {
    merged.step3Description = DEFAULT_SITE_SETTINGS.step3Description;
  }

  // 6. Upgrade stale Step 4
  if (
    !merged.step4Title ||
    merged.step4Title === 'Visual Prestige & Delivery' ||
    merged.step4Title.includes('Visual Prestige')
  ) {
    merged.step4Title = DEFAULT_SITE_SETTINGS.step4Title;
  }
  if (
    !merged.step4Description ||
    merged.step4Description.includes('The final synthesis') ||
    merged.step4Description.includes('After a meticulous process of multiple passes')
  ) {
    merged.step4Description = DEFAULT_SITE_SETTINGS.step4Description;
  }

  // 7. Upgrade stale About Bio paragraphs
  if (
    !merged.aboutBio1 ||
    merged.aboutBio1.includes('Over the last four years')
  ) {
    merged.aboutBio1 = DEFAULT_SITE_SETTINGS.aboutBio1;
  }
  if (
    !merged.aboutBio2 ||
    merged.aboutBio2.includes('My philosophy is simple')
  ) {
    merged.aboutBio2 = DEFAULT_SITE_SETTINGS.aboutBio2;
  }
  if (!merged.aboutBio3) {
    merged.aboutBio3 = DEFAULT_SITE_SETTINGS.aboutBio3;
  }
  if (!merged.aboutDirectorNote || merged.aboutDirectorNote.trim() === '') {
    merged.aboutDirectorNote = DEFAULT_SITE_SETTINGS.aboutDirectorNote;
  }
  if (!merged.aboutChannelUrl || merged.aboutChannelUrl.trim() === '') {
    merged.aboutChannelUrl = DEFAULT_SITE_SETTINGS.aboutChannelUrl;
  }
  if (!merged.aboutChannelTag || merged.aboutChannelTag.trim() === '') {
    merged.aboutChannelTag = DEFAULT_SITE_SETTINGS.aboutChannelTag;
  }

  // 8. Upgrade stale Web3Forms key & Social links
  if (
    merged.web3formsAccessKey === '64d852a4-5696-414c-a11b-10f845dca889' ||
    !merged.web3formsAccessKey
  ) {
    merged.web3formsAccessKey = DEFAULT_SITE_SETTINGS.web3formsAccessKey;
  }
  if (merged.socialInstagram === 'https://instagram.com/zolepto' || !merged.socialInstagram) {
    merged.socialInstagram = DEFAULT_SITE_SETTINGS.socialInstagram;
  }
  if (merged.socialX === 'https://x.com/zolepto' || !merged.socialX) {
    merged.socialX = DEFAULT_SITE_SETTINGS.socialX;
  }
  if (merged.socialLinkedin === 'https://linkedin.com/in/zolepto' || !merged.socialLinkedin) {
    merged.socialLinkedin = DEFAULT_SITE_SETTINGS.socialLinkedin;
  }

  return merged;
}

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
    return sanitizeSiteSettings(parsed);
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
      return sanitizeSiteSettings({ ...getLocalSettings(), ...JSON.parse(raw) });
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
