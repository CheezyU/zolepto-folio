import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Layers,
  Scissors,
  Share2,
  Lock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Send,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Trash2,
  Play,
  ArrowUpRight,
  Film,
  Loader2,
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { DEFAULT_SITE_SETTINGS, sanitizeSiteSettings } from '../../services/siteSettingsService';
import { cleanImageUrl, isImgbbViewerUrl, resolveImgbbViewerUrl } from '../../lib/imageUtils';
import { ROTATING_ROLES } from '../../data/portfolioData';

interface VisualCopyEditorProps {
  settings: SiteSettings;
  onPublishToGitHub: (updated: SiteSettings) => Promise<void>;
  isPublishing: boolean;
  status: { type: 'success' | 'error'; text: string } | null;
}

type EditorSection = 'hero' | 'workshop' | 'about' | 'socials' | 'consultation';

// Minimalist architectural shapes matching live ProcessSection
const ClientSilhouetteShape = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-zinc-900/[0.08]">
    <circle cx="50" cy="32" r="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M22 84 C 22 62, 34 54, 50 54 C 66 54, 78 62, 78 84" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const LightbulbShape = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-zinc-900/[0.08]">
    <path d="M50 18 C 36 18, 28 28, 28 40 C 28 49, 34 56, 38 62 L 38 68 C 38 70, 40 72, 42 72 L 58 72 C 60 72, 62 70, 62 68 L 62 62 C 66 56, 72 49, 72 40 C 72 28, 64 18, 50 18 Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="42" y1="78" x2="58" y2="78" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="46" y1="84" x2="54" y2="84" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const EyeShape = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-zinc-900/[0.08]">
    <path d="M14 50 C 26 28, 74 28, 86 50 C 74 72, 26 72, 14 50 Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="50" cy="50" r="4.5" fill="currentColor" />
  </svg>
);

const PaperPlaneShape = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-zinc-900/[0.08]">
    <path d="M16 52 L 86 18 L 52 84 L 42 56 Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="86" y1="18" x2="42" y2="56" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Authentic hand-drawn organic circular paths matching ProcessSection
const HANDDRAWN_STEP_PATHS: Record<number, string> = {
  1: 'M 49,10 C 74,8 92,23 91,48 C 90,74 74,91 49,90 C 23,89 9,73 10,48 C 11,23 27,11 49,10 Z',
  2: 'M 52,9 C 77,12 92,28 90,52 C 88,77 71,92 47,91 C 21,90 8,72 10,47 C 12,21 26,8 52,9 Z',
  3: 'M 47,11 C 72,10 90,26 91,51 C 92,75 75,91 51,90 C 25,89 10,75 9,51 C 8,26 23,12 47,11 Z',
  4: 'M 50,9 C 75,8 93,24 91,49 C 89,74 74,91 49,90 C 23,89 10,74 11,49 C 12,23 26,10 50,9 Z',
};

const SKETCH_OUTLINES: Record<number, string> = {
  1: 'M 51,6 C 78,5 96,22 94,52 C 92,78 72,95 46,94 C 18,93 6,75 7,49 C 8,22 25,7 51,6 C 73,5 92,18 95,44',
  2: 'M 54,6 C 80,10 95,27 94,55 C 93,81 70,96 44,95 C 17,94 5,73 8,46 C 11,18 27,5 54,6 C 77,8 94,23 92,48',
  3: 'M 45,7 C 73,6 93,24 95,53 C 97,80 73,95 48,94 C 20,93 6,77 6,49 C 6,21 23,8 45,7 C 71,7 93,21 94,46',
  4: 'M 52,6 C 78,5 96,22 94,52 C 92,78 72,95 46,94 C 19,93 6,75 8,48 C 10,21 27,6 52,6 C 76,6 94,18 92,42',
};

export const VisualCopyEditor: React.FC<VisualCopyEditorProps> = ({
  settings: initialSettings,
  onPublishToGitHub,
  isPublishing,
  status,
}) => {
  const [form, setForm] = useState<SiteSettings>(() => {
    try {
      const draft = localStorage.getItem('zolepto_site_settings_draft');
      if (draft) {
        return sanitizeSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...initialSettings, ...JSON.parse(draft) });
      }
    } catch {}
    return sanitizeSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...initialSettings });
  });

  const [activeSection, setActiveSection] = useState<EditorSection>('hero');
  const [hasChanges, setHasChanges] = useState(() => {
    return Boolean(localStorage.getItem('zolepto_site_settings_draft'));
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const darkLogoFileInputRef = useRef<HTMLInputElement>(null);
  const lightLogoFileInputRef = useRef<HTMLInputElement>(null);

  // Rotating roles synchronization for profile avatar preview (2800ms)
  const [roleIndex, setRoleIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROTATING_ROLES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('zolepto_admin_editing_active', 'true');
    return () => {
      localStorage.removeItem('zolepto_admin_editing_active');
    };
  }, []);

  useEffect(() => {
    if (!hasChanges) {
      setForm(sanitizeSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...initialSettings }));
    }
  }, [initialSettings, hasChanges]);

  // Safety length limits configuration
  const LIMITS = {
    heroTitleLine1: 50,
    heroTitleLine2: 50,
    heroSubtitle: 250,
    availabilityStatus: 45,
    heroStatValue: 16,
    heroStatLabel: 36,
    workshopHeading: 80,
    workshopSubtitle: 220,
    stepTitle: 50,
    stepDescription: 320,
    aboutHeading: 60,
    aboutBio1: 320,
    aboutBio2: 320,
    aboutBio3: 320,
    aboutDirectorNote: 160,
    contactEmail: 60,
  };

  const [isResolvingProfileUrl, setIsResolvingProfileUrl] = useState(false);
  const [profileUrlNotice, setProfileUrlNotice] = useState<string | null>(null);

  const handleChange = (field: keyof SiteSettings, value: any, maxLength?: number) => {
    let finalVal = value;
    if (maxLength && typeof value === 'string' && value.length > maxLength) {
      finalVal = value.slice(0, maxLength);
    }
    setForm((prev) => {
      const updated = { ...prev, [field]: finalVal };
      try {
        localStorage.setItem('zolepto_site_settings_draft', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setHasChanges(true);
  };

  const handleProfileUrlInput = async (val: string) => {
    const cleaned = cleanImageUrl(val);
    handleChange('profilePictureUrl', cleaned);

    if (isImgbbViewerUrl(cleaned) || isImgbbViewerUrl(val)) {
      setIsResolvingProfileUrl(true);
      setProfileUrlNotice('Resolving ImgBB page to full-res direct image...');
      try {
        const direct = await resolveImgbbViewerUrl(cleaned || val);
        if (direct && direct !== cleaned) {
          handleChange('profilePictureUrl', direct);
          setProfileUrlNotice('✓ ImgBB image resolved to direct link');
          setTimeout(() => setProfileUrlNotice(null), 3000);
        } else {
          setProfileUrlNotice(null);
        }
      } catch {
        setProfileUrlNotice(null);
      } finally {
        setIsResolvingProfileUrl(false);
      }
    } else {
      setProfileUrlNotice(null);
    }
  };

  const handleDarkLogoUrlInput = async (val: string) => {
    const cleaned = cleanImageUrl(val);
    handleChange('headerLogoDarkUrl', cleaned);
    handleChange('headerLogoUrl', cleaned); // sync fallback

    if (isImgbbViewerUrl(cleaned) || isImgbbViewerUrl(val)) {
      try {
        const direct = await resolveImgbbViewerUrl(cleaned || val);
        if (direct && direct !== cleaned) {
          handleChange('headerLogoDarkUrl', direct);
          handleChange('headerLogoUrl', direct);
        }
      } catch {}
    }
  };

  const handleLightLogoUrlInput = async (val: string) => {
    const cleaned = cleanImageUrl(val);
    handleChange('headerLogoLightUrl', cleaned);

    if (isImgbbViewerUrl(cleaned) || isImgbbViewerUrl(val)) {
      try {
        const direct = await resolveImgbbViewerUrl(cleaned || val);
        if (direct && direct !== cleaned) {
          handleChange('headerLogoLightUrl', direct);
        }
      } catch {}
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Image file size should be less than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleChange('profilePictureUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDarkLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Logo file size should be less than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleChange('headerLogoDarkUrl', reader.result);
        handleChange('headerLogoUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLightLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Logo file size should be less than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleChange('headerLogoLightUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all copy to default editorial studio text? This will discard all draft changes.')) {
      try {
        localStorage.removeItem('zolepto_site_settings_draft');
        localStorage.removeItem('zolepto_site_settings');
      } catch {}
      setForm({ ...DEFAULT_SITE_SETTINGS });
      setHasChanges(false);
    }
  };

  const handlePublish = async () => {
    await onPublishToGitHub(form);
    try {
      localStorage.removeItem('zolepto_site_settings_draft');
    } catch {}
    setHasChanges(false);
  };

  const renderMeter = (currentLength: number, max: number) => {
    const pct = Math.min(100, Math.round((currentLength / max) * 100));
    const isClose = pct >= 85;
    const isAtLimit = pct >= 100;

    return (
      <div className="flex items-center gap-1.5 font-mono text-[10px]">
        <span
          className={
            isAtLimit
              ? 'text-rose-500 font-bold'
              : isClose
              ? 'text-amber-500 font-medium'
              : 'text-zinc-400'
          }
        >
          {currentLength}/{max}
        </span>
        <div className="w-10 h-1 bg-zinc-300/40 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isAtLimit ? 'bg-rose-500' : isClose ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <span>Visual Website Copy Editor</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Replica
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Hands-on visual replica mimicking the exact containers, typography, and shapes of the live website. Changes are safely previewed before publishing.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-600 transition-colors cursor-pointer"
            title="Reset to default text"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            id="editor-publish-github-btn"
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold tracking-wide transition-all disabled:opacity-50 cursor-pointer shadow-md"
            title="Commit and publish all changes directly to GitHub and Global Cloud"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing to GitHub...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish to GitHub</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {status && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span className="font-medium">{status.text}</span>
        </div>
      )}

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'hero', label: '01. Header & Hero', icon: Globe },
          { id: 'workshop', label: '02. Process & Workflow', icon: Layers },
          { id: 'about', label: '03. About Me', icon: Scissors },
          { id: 'socials', label: '04. Social Profiles', icon: Share2 },
          { id: 'consultation', label: "05. Let's Create", icon: Lock },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id as EditorSection)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* SECTION 1: HEADER & HERO IDENTITY (VISUAL REPLICA)               */}
      {/* ================================================================ */}
      {activeSection === 'hero' && (
        <div className="space-y-6">
          {/* Header Brand Logo & Home Button Card */}
          <div className="rounded-3xl bg-white border border-zinc-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-display text-base font-bold text-zinc-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Header Brand Logo & Home Button</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Upload or link separate logos for dark (top of page) and light (scrolled) navigation states so your logo color always contrasts perfectly.
                </p>
              </div>

              {((form.headerLogoDarkUrl || form.headerLogoUrl) || form.headerLogoLightUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    handleChange('headerLogoDarkUrl', '');
                    handleChange('headerLogoLightUrl', '');
                    handleChange('headerLogoUrl', '');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer self-start sm:self-auto"
                  title="Revert both logos to default film reel mark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revert Both to Default</span>
                </button>
              )}
            </div>

            {/* Hidden File Inputs for Dual Logo Uploads */}
            <input
              type="file"
              ref={darkLogoFileInputRef}
              onChange={handleDarkLogoUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={lightLogoFileInputRef}
              onChange={handleLightLogoUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Two Images Option Grid: Dark Header & Light Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Option 1: Dark Header Logo (Top of page / Dark background) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-900" />
                    <span>1. Dark Header Logo (Top of Page)</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-200/70">
                    Dark Background
                  </span>
                </div>

                {/* Dark State Visual Preview */}
                <div className="p-3.5 rounded-xl bg-[#0d0e12] border border-white/10 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    {(form.headerLogoDarkUrl || form.headerLogoUrl) ? (
                      <div className="relative flex items-center justify-center shrink-0">
                        <img
                          src={form.headerLogoDarkUrl || form.headerLogoUrl}
                          alt="Dark header logo"
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          referrerPolicy="no-referrer"
                          className="h-8 sm:h-9 w-auto max-w-[120px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 p-0.5 flex items-center justify-center">
                        <Film className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <span className="font-display font-bold text-sm text-white">Zolepto</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Frosted Glass</span>
                </div>

                {/* Dark Logo Controls */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => darkLogoFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Dark Logo</span>
                    </button>

                    {(form.headerLogoDarkUrl || form.headerLogoUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('headerLogoDarkUrl', '');
                          handleChange('headerLogoUrl', '');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 transition-colors cursor-pointer"
                        title="Reset dark logo"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                    <span className="text-[10px] font-mono text-zinc-400 ml-auto">White / Light asset</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 block font-medium">
                      Or Paste Dark Logo Image URL:
                    </label>
                    <input
                      type="text"
                      value={form.headerLogoDarkUrl || form.headerLogoUrl || ''}
                      onChange={(e) => handleDarkLogoUrlInput(e.target.value)}
                      placeholder="https://... (direct image link, ImgBB, etc.)"
                      className="w-full text-xs font-mono text-zinc-800 bg-white border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-900 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Option 2: Light Header Logo (Scrolled down / Light background) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>2. Light Header Logo (Scrolled)</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-200/70">
                    Light Background
                  </span>
                </div>

                {/* Light State Visual Preview */}
                <div className="p-3.5 rounded-xl bg-white border border-zinc-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    {(form.headerLogoLightUrl || form.headerLogoDarkUrl || form.headerLogoUrl) ? (
                      <div className="relative flex items-center justify-center shrink-0">
                        <img
                          src={form.headerLogoLightUrl || form.headerLogoDarkUrl || form.headerLogoUrl}
                          alt="Light header logo"
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          referrerPolicy="no-referrer"
                          className="h-8 sm:h-9 w-auto max-w-[120px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] select-none pointer-events-none"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 p-0.5 flex items-center justify-center">
                        <Film className="w-3.5 h-3.5 text-zinc-950" />
                      </div>
                    )}
                    <span className="font-display font-bold text-sm text-zinc-900">Zolepto</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Frosted Glass</span>
                </div>

                {/* Light Logo Controls */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => lightLogoFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Light Logo</span>
                    </button>

                    {form.headerLogoLightUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('headerLogoLightUrl', '')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 transition-colors cursor-pointer"
                        title="Reset light logo"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                    <span className="text-[10px] font-mono text-zinc-400 ml-auto">Dark / Black asset</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 block font-medium">
                      Or Paste Light Logo Image URL:
                    </label>
                    <input
                      type="text"
                      value={form.headerLogoLightUrl || ''}
                      onChange={(e) => handleLightLogoUrlInput(e.target.value)}
                      placeholder="https://... (direct image link, ImgBB, etc.)"
                      className="w-full text-xs font-mono text-zinc-800 bg-white border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-900 transition-colors"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-xs font-mono text-zinc-500">
            <span>VISUAL REPLICA // HERO SECTION</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Interactive In-Canvas Editing
            </span>
          </div>

          {/* Real Hero Section Frame Replica */}
          <div className="relative rounded-3xl bg-[#0d0e13] text-zinc-100 p-6 sm:p-10 border border-zinc-800 shadow-xl overflow-hidden">
            {/* Ambient Spotlight & Blueprint Grid */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[300px] bg-amber-500/10 blur-[110px] rounded-full pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[380px] h-[280px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 blueprint-dots opacity-20 pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Creator Profile Avatar & Availability Status */}
              <div className="order-first lg:order-last lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative flex flex-col items-center">
                  {/* Arched Rotating Role Indicator Frame */}
                  <div className="relative flex items-center justify-center">
                    {/* SVG Arch Element wrapping the top curve of avatar */}
                    <div
                      className="absolute -inset-5 sm:-inset-6 pointer-events-none select-none z-20 overflow-visible flex items-center justify-center"
                      aria-label="Current role preview"
                    >
                      <svg
                        viewBox="0 0 320 320"
                        className="w-full h-full overflow-visible"
                      >
                        <defs>
                          <path
                            id="adminAvatarRoleArc"
                            d="M 22,160 A 138,138 0 0,1 298,160"
                            fill="none"
                          />
                        </defs>
                        <path
                          d="M 30,160 A 130,130 0 0,1 290,160"
                          fill="none"
                          stroke="rgba(255,255,255,0.14)"
                          strokeWidth="1"
                          strokeDasharray="3 4"
                        />
                        <AnimatePresence mode="wait">
                          <motion.g
                            key={roleIndex}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <text
                              className="fill-zinc-100 text-[11px] font-mono font-bold tracking-[0.24em] uppercase select-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
                            >
                              <textPath
                                href="#adminAvatarRoleArc"
                                startOffset="50%"
                                textAnchor="middle"
                              >
                                {ROTATING_ROLES[roleIndex]}
                              </textPath>
                            </text>
                          </motion.g>
                        </AnimatePresence>
                      </svg>
                    </div>

                    {/* Round Avatar Container */}
                    <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full border-2 border-white/25 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-white/10 group">
                      {form.profilePictureUrl ? (
                        <img
                          src={form.profilePictureUrl}
                          alt="Profile avatar"
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          className="w-full h-full object-cover select-none pointer-events-none"
                          onError={async (e) => {
                            const target = e.target as HTMLImageElement;
                            if (form.profilePictureUrl && isImgbbViewerUrl(form.profilePictureUrl)) {
                              const direct = await resolveImgbbViewerUrl(form.profilePictureUrl);
                              if (direct && direct !== form.profilePictureUrl) {
                                target.src = direct;
                                handleChange('profilePictureUrl', direct);
                              }
                            }
                          }}
                        />
                      ) : (
                        <svg
                          className="w-full h-full text-zinc-400/50 translate-y-3"
                          viewBox="0 0 200 200"
                          fill="currentColor"
                        >
                          <circle cx="100" cy="74" r="34" />
                          <path d="M92 104H108V120H92z" />
                          <path d="M40 186 C40 142, 68 126, 100 126 C132 126, 160 142, 160 186 C160 192, 156 196, 150 196 H50 C44 196, 40 192, 40 186 Z" />
                        </svg>
                      )}

                      {/* Active Status Dot */}
                      <div className="absolute bottom-2.5 right-2.5 sm:bottom-3.5 sm:right-3.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-xs" />
                    </div>
                  </div>

                  {/* Handdrawn Freeform Availability Script */}
                  <div className="mt-3.5 flex items-center justify-center -rotate-2 select-none">
                    <div className="flex items-center gap-1.5 px-2 py-0.5">
                      {form.showAvailabilityDot !== false && (
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        </span>
                      )}
                      <input
                        type="text"
                        value={form.availabilityStatus || ''}
                        maxLength={LIMITS.availabilityStatus}
                        onChange={(e) =>
                          handleChange('availabilityStatus', e.target.value, LIMITS.availabilityStatus)
                        }
                        className="font-handwriting text-lg sm:text-xl text-emerald-300 font-medium tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] bg-transparent border-b border-dashed border-emerald-400/40 hover:border-emerald-400 focus:border-emerald-400 focus:outline-none text-center px-1 max-w-[240px]"
                        placeholder="Available for incoming projects!"
                        title="Edit availability status text directly"
                      />
                      <svg
                        className="w-4 h-4 text-emerald-400/90 -rotate-12 shrink-0 ml-0.5 opacity-80"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 14c4-3 8-4 14-2" />
                        <path d="M14 8l4 4-4 4" />
                      </svg>
                    </div>
                  </div>

                  {/* Photo Controls */}
                  <div className="mt-3 w-full max-w-xs space-y-2 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfileImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>
                      {form.profilePictureUrl && (
                        <button
                          type="button"
                          onClick={() => handleChange('profilePictureUrl', '')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 border border-white/10 text-xs transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={form.profilePictureUrl || ''}
                      onChange={(e) => handleProfileUrlInput(e.target.value)}
                      placeholder="Paste image link, ImgBB link, or BBCode"
                      className="w-full text-[11px] font-mono text-zinc-200 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-white/30 text-center"
                    />
                    {profileUrlNotice && (
                      <div className="text-[10px] font-mono text-emerald-300 flex items-center justify-center gap-1.5 pt-0.5">
                        {isResolvingProfileUrl && <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />}
                        <span>{profileUrlNotice}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Left Column: Bold Display Typography & Direct In-Canvas Editing */}
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                {/* Headline Line 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 px-1">
                    <span>HEADLINE LINE 1</span>
                    {renderMeter((form.heroTitleLine1 || '').length, LIMITS.heroTitleLine1)}
                  </div>
                  <input
                    type="text"
                    value={form.heroTitleLine1}
                    maxLength={LIMITS.heroTitleLine1}
                    onChange={(e) =>
                      handleChange('heroTitleLine1', e.target.value, LIMITS.heroTitleLine1)
                    }
                    className="w-full font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12] bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-white/30 rounded-xl px-3 py-1.5 focus:outline-none transition-all"
                  />
                </div>

                {/* Headline Line 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 px-1">
                    <span>HEADLINE LINE 2 (SUB-HEADER)</span>
                    {renderMeter((form.heroTitleLine2 || '').length, LIMITS.heroTitleLine2)}
                  </div>
                  <input
                    type="text"
                    value={form.heroTitleLine2}
                    maxLength={LIMITS.heroTitleLine2}
                    onChange={(e) =>
                      handleChange('heroTitleLine2', e.target.value, LIMITS.heroTitleLine2)
                    }
                    className="w-full font-display text-lg sm:text-2xl lg:text-3xl font-medium tracking-tight text-zinc-300 leading-snug bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-white/30 rounded-xl px-3 py-1.5 focus:outline-none transition-all"
                  />
                </div>

                {/* Narrative Subtitle */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 px-1">
                    <span>NARRATIVE SUBTITLE</span>
                    {renderMeter((form.heroSubtitle || '').length, LIMITS.heroSubtitle)}
                  </div>
                  <textarea
                    rows={3}
                    value={form.heroSubtitle}
                    maxLength={LIMITS.heroSubtitle}
                    onChange={(e) =>
                      handleChange('heroSubtitle', e.target.value, LIMITS.heroSubtitle)
                    }
                    placeholder="I team up with creators and brands to build videos worth staying for, and an audience that actually comes back, not just views."
                    className="w-full text-xs sm:text-sm text-zinc-300 font-body leading-relaxed bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 focus:border-white/30 rounded-xl p-3 focus:outline-none transition-all resize-y"
                  />
                </div>

                {/* Mock Hero Buttons Preview */}
                <div className="pt-2 flex flex-row items-center justify-center lg:justify-start gap-3 opacity-90 select-none pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-zinc-950 font-semibold text-xs shadow-md">
                    <div className="w-5 h-5 rounded-full bg-zinc-950 flex items-center justify-center text-white">
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    </div>
                    <span>Watch Showreel</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold">
                    <span>Send Project</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>

                {/* Credibility Metrics (14M+ Organic Views, etc.) */}
                <div className="pt-5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      Credibility Metrics (Live Site Footer Grid)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-white/10 text-center sm:text-left gap-2 sm:gap-3">
                    {/* Stat 1: Organic Views */}
                    <div className="px-1 sm:px-2 space-y-1">
                      <input
                        type="text"
                        value={form.heroStat1Value || '14M+'}
                        maxLength={LIMITS.heroStatValue}
                        onChange={(e) =>
                          handleChange('heroStat1Value', e.target.value, LIMITS.heroStatValue)
                        }
                        className="w-full font-bold text-white font-display text-sm sm:text-lg tracking-tight bg-white/5 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-white/30 text-center sm:text-left"
                        title="Stat value (e.g. 14M+)"
                      />
                      <input
                        type="text"
                        value={form.heroStat1Label || 'Organic Views'}
                        maxLength={LIMITS.heroStatLabel}
                        onChange={(e) =>
                          handleChange('heroStat1Label', e.target.value, LIMITS.heroStatLabel)
                        }
                        className="w-full text-[10px] sm:text-xs font-mono text-zinc-400 bg-transparent border-b border-white/10 hover:border-white/20 focus:border-white/40 px-1 py-0.5 focus:outline-none text-center sm:text-left"
                        title="Stat label (e.g. Organic Views)"
                      />
                    </div>

                    {/* Stat 2: Experience */}
                    <div className="px-1 sm:pl-4 space-y-1">
                      <input
                        type="text"
                        value={form.heroStat2Value || '4+ Years'}
                        maxLength={LIMITS.heroStatValue}
                        onChange={(e) =>
                          handleChange('heroStat2Value', e.target.value, LIMITS.heroStatValue)
                        }
                        className="w-full font-bold text-white font-display text-sm sm:text-lg tracking-tight bg-white/5 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-white/30 text-center sm:text-left"
                        title="Stat value (e.g. 4+ Years)"
                      />
                      <input
                        type="text"
                        value={form.heroStat2Label || 'Multimedia & Content Creation'}
                        maxLength={LIMITS.heroStatLabel}
                        onChange={(e) =>
                          handleChange('heroStat2Label', e.target.value, LIMITS.heroStatLabel)
                        }
                        className="w-full text-[10px] sm:text-xs font-mono text-zinc-400 bg-transparent border-b border-white/10 hover:border-white/20 focus:border-white/40 px-1 py-0.5 focus:outline-none text-center sm:text-left"
                        title="Stat label (e.g. Multimedia & Content Creation)"
                      />
                    </div>

                    {/* Stat 3: Direct Direction */}
                    <div className="px-1 sm:pl-4 space-y-1">
                      <input
                        type="text"
                        value={form.heroStat3Value || '1-on-1'}
                        maxLength={LIMITS.heroStatValue}
                        onChange={(e) =>
                          handleChange('heroStat3Value', e.target.value, LIMITS.heroStatValue)
                        }
                        className="w-full font-bold text-white font-display text-sm sm:text-lg tracking-tight bg-white/5 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-white/30 text-center sm:text-left"
                        title="Stat value (e.g. 1-on-1)"
                      />
                      <input
                        type="text"
                        value={form.heroStat3Label || 'Direct Direction'}
                        maxLength={LIMITS.heroStatLabel}
                        onChange={(e) =>
                          handleChange('heroStat3Label', e.target.value, LIMITS.heroStatLabel)
                        }
                        className="w-full text-[10px] sm:text-xs font-mono text-zinc-400 bg-transparent border-b border-white/10 hover:border-white/20 focus:border-white/40 px-1 py-0.5 focus:outline-none text-center sm:text-left"
                        title="Stat label (e.g. Direct Direction)"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 2: FOUR STEPS (PROCESS & WORKFLOW)                       */}
      {/* ================================================================ */}
      {activeSection === 'workshop' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs font-mono text-zinc-500">
            <span>VISUAL REPLICA // FOUR STEPS (PROCESS &amp; WORKFLOW)</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Direct Visual Preview
            </span>
          </div>

          {/* Authentic Process Container */}
          <div className="relative rounded-3xl bg-[#fafafa] text-zinc-900 p-6 sm:p-10 border border-zinc-200 shadow-sm overflow-hidden space-y-10">
            {/* Subtle Studio Lighting matching live site */}
            <div
              className="absolute -top-24 -left-24 w-96 h-96 pointer-events-none rounded-full blur-3xl opacity-50"
              style={{
                background: 'radial-gradient(circle, rgba(24, 24, 27, 0.035) 0%, rgba(24, 24, 27, 0) 70%)',
              }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-96 h-96 pointer-events-none rounded-full blur-3xl opacity-50"
              style={{
                background: 'radial-gradient(circle, rgba(24, 24, 27, 0.03) 0%, rgba(24, 24, 27, 0) 70%)',
              }}
            />

            {/* Technical Registration Crosshairs */}
            <div className="absolute top-6 left-6 text-zinc-300 font-mono text-[10px] select-none pointer-events-none hidden sm:block">
              + [ PROCESS BLUEPRINT // REF-2026 ]
            </div>
            <div className="absolute top-6 right-6 text-zinc-300 font-mono text-[10px] select-none pointer-events-none hidden sm:block">
              SCALE 1:1 // 24.00 FPS +
            </div>

            {/* Process Header Visual Replica */}
            <div className="max-w-2xl mx-auto text-center space-y-3 relative z-10 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 font-mono text-[10px] uppercase tracking-widest font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
                OUR PROCESS
              </div>

              {/* Editable Section Title */}
              <div className="space-y-1">
                <div className="flex justify-center items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <span>SECTION HEADING</span>
                  {renderMeter((form.workshopHeading || '').length, LIMITS.workshopHeading)}
                </div>
                <input
                  type="text"
                  value={form.workshopHeading || 'Four steps from your idea to your audience.'}
                  maxLength={LIMITS.workshopHeading}
                  onChange={(e) =>
                    handleChange('workshopHeading', e.target.value, LIMITS.workshopHeading)
                  }
                  className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 text-center bg-transparent border-b border-zinc-300 hover:border-zinc-400 focus:border-zinc-900 focus:outline-none w-full pb-1"
                />
              </div>

              {/* Hand-drawn scribble underline */}
              <div className="w-44 sm:w-56 h-2 mx-auto text-zinc-300">
                <svg viewBox="0 0 240 12" fill="none" className="w-full h-full">
                  <path
                    d="M4 8.5C60 3.5 130 4 236 7C175 10 90 10.5 4 9"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Editable Subtitle */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-center items-center gap-2 text-[10px] font-mono text-zinc-400">
                  <span>SECTION SUBTITLE</span>
                  {renderMeter((form.workshopSubtitle || '').length, LIMITS.workshopSubtitle)}
                </div>
                <textarea
                  rows={2}
                  value={
                    form.workshopSubtitle ||
                    'No rigid agency steps or generic templates. A deliberate, human creative process mapped out like a workshop drafting sheet—breaking things down to discover what truly resonates.'
                  }
                  maxLength={LIMITS.workshopSubtitle}
                  onChange={(e) =>
                    handleChange('workshopSubtitle', e.target.value, LIMITS.workshopSubtitle)
                  }
                  className="w-full text-xs sm:text-sm text-zinc-600 font-body text-center bg-white/70 border border-zinc-200 focus:border-zinc-900 rounded-xl p-3 focus:outline-none resize-y"
                />
              </div>
            </div>

            {/* The 4 Steps: Direct Editable Cards with live styling & shapes */}
            <div className="space-y-6 relative z-10">
              
              {/* Step 01: Identifying YOU */}
              <div className="relative p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200 shadow-2xs overflow-hidden">
                <div className="absolute right-4 bottom-4 w-28 h-28 pointer-events-none opacity-40">
                  <ClientSilhouetteShape />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center relative select-none shrink-0">
                      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100">
                        <path d={SKETCH_OUTLINES[1]} fill="none" stroke="#d4d4d8" strokeWidth="1.6" strokeLinecap="round" />
                        <path d={HANDDRAWN_STEP_PATHS[1]} fill="#ffffff" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-mono text-sm font-bold text-zinc-900 relative z-10">01</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>STEP 1 TITLE</span>
                        {renderMeter((form.step1Title || '').length, LIMITS.stepTitle)}
                      </div>
                      <input
                        type="text"
                        value={form.step1Title || 'Identifying YOU'}
                        maxLength={LIMITS.stepTitle}
                        onChange={(e) => handleChange('step1Title', e.target.value, LIMITS.stepTitle)}
                        placeholder="Identifying YOU"
                        className="w-full font-display text-lg sm:text-xl font-bold tracking-tight text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-1.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>STEP 1 DESCRIPTION</span>
                      {renderMeter((form.step1Description || '').length, LIMITS.stepDescription)}
                    </div>
                    <textarea
                      rows={3}
                      value={
                        form.step1Description ||
                        "I start with you: your authentic side, what your content stands for, and who you're actually trying to reach. Your content and ideas come first, before I touch the footage."
                      }
                      maxLength={LIMITS.stepDescription}
                      onChange={(e) => handleChange('step1Description', e.target.value, LIMITS.stepDescription)}
                      placeholder="I start with you: your authentic side..."
                      className="w-full text-xs sm:text-sm text-zinc-700 font-normal leading-relaxed bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-zinc-900 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Step 02: Dissecting the Narrative */}
              <div className="relative p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200 shadow-2xs overflow-hidden">
                <div className="absolute right-4 bottom-4 w-28 h-28 pointer-events-none opacity-40">
                  <LightbulbShape />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center relative select-none shrink-0">
                      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100">
                        <path d={SKETCH_OUTLINES[2]} fill="none" stroke="#d4d4d8" strokeWidth="1.6" strokeLinecap="round" />
                        <path d={HANDDRAWN_STEP_PATHS[2]} fill="#ffffff" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-mono text-sm font-bold text-zinc-900 relative z-10">02</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>STEP 2 TITLE</span>
                        {renderMeter((form.step2Title || '').length, LIMITS.stepTitle)}
                      </div>
                      <input
                        type="text"
                        value={form.step2Title || 'Dissecting the Narrative'}
                        maxLength={LIMITS.stepTitle}
                        onChange={(e) => handleChange('step2Title', e.target.value, LIMITS.stepTitle)}
                        placeholder="Dissecting the Narrative"
                        className="w-full font-display text-lg sm:text-xl font-bold tracking-tight text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-1.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>STEP 2 DESCRIPTION</span>
                      {renderMeter((form.step2Description || '').length, LIMITS.stepDescription)}
                    </div>
                    <textarea
                      rows={3}
                      value={
                        form.step2Description ||
                        "The value of your content matters more than flashy edits. I lift your story in the style you envision, and every cut, effect, and transition has to serve the progression of the video."
                      }
                      maxLength={LIMITS.stepDescription}
                      onChange={(e) => handleChange('step2Description', e.target.value, LIMITS.stepDescription)}
                      placeholder="The value of your content matters more than flashy edits..."
                      className="w-full text-xs sm:text-sm text-zinc-700 font-normal leading-relaxed bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-zinc-900 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Step 03: Look Beyond the Process */}
              <div className="relative p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200 shadow-2xs overflow-hidden">
                <div className="absolute right-4 bottom-4 w-28 h-28 pointer-events-none opacity-40">
                  <EyeShape />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center relative select-none shrink-0">
                      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100">
                        <path d={SKETCH_OUTLINES[3]} fill="none" stroke="#d4d4d8" strokeWidth="1.6" strokeLinecap="round" />
                        <path d={HANDDRAWN_STEP_PATHS[3]} fill="#ffffff" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-mono text-sm font-bold text-zinc-900 relative z-10">03</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>STEP 3 TITLE</span>
                        {renderMeter((form.step3Title || '').length, LIMITS.stepTitle)}
                      </div>
                      <input
                        type="text"
                        value={form.step3Title || 'Look Beyond the Process'}
                        maxLength={LIMITS.stepTitle}
                        onChange={(e) => handleChange('step3Title', e.target.value, LIMITS.stepTitle)}
                        placeholder="Look Beyond the Process"
                        className="w-full font-display text-lg sm:text-xl font-bold tracking-tight text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-1.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>STEP 3 DESCRIPTION</span>
                      {renderMeter((form.step3Description || '').length, LIMITS.stepDescription)}
                    </div>
                    <textarea
                      rows={3}
                      value={
                        form.step3Description ||
                        "I step out of editing mode and actually watch it as your own viewer would. Does the edit elevate the story? Was it worth watching? Every second has to be justified."
                      }
                      maxLength={LIMITS.stepDescription}
                      onChange={(e) => handleChange('step3Description', e.target.value, LIMITS.stepDescription)}
                      placeholder="I step out of editing mode and actually watch it as your own viewer would..."
                      className="w-full text-xs sm:text-sm text-zinc-700 font-normal leading-relaxed bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-zinc-900 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Step 04: Official Drop */}
              <div className="relative p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200 shadow-2xs overflow-hidden">
                <div className="absolute right-4 bottom-4 w-28 h-28 pointer-events-none opacity-40">
                  <PaperPlaneShape />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center relative select-none shrink-0">
                      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100">
                        <path d={SKETCH_OUTLINES[4]} fill="none" stroke="#d4d4d8" strokeWidth="1.6" strokeLinecap="round" />
                        <path d={HANDDRAWN_STEP_PATHS[4]} fill="#ffffff" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-mono text-sm font-bold text-zinc-900 relative z-10">04</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>STEP 4 TITLE</span>
                        {renderMeter((form.step4Title || '').length, LIMITS.stepTitle)}
                      </div>
                      <input
                        type="text"
                        value={form.step4Title || 'Official Drop'}
                        maxLength={LIMITS.stepTitle}
                        onChange={(e) => handleChange('step4Title', e.target.value, LIMITS.stepTitle)}
                        placeholder="Official Drop"
                        className="w-full font-display text-lg sm:text-xl font-bold tracking-tight text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-1.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>STEP 4 DESCRIPTION</span>
                      {renderMeter((form.step4Description || '').length, LIMITS.stepDescription)}
                    </div>
                    <textarea
                      rows={3}
                      value={
                        form.step4Description ||
                        "Multiple passes, with every cut, layer, and effect double-checked, then delivered on the promised date. Total transparency, zero ghosting, and easy collaboration."
                      }
                      maxLength={LIMITS.stepDescription}
                      onChange={(e) => handleChange('step4Description', e.target.value, LIMITS.stepDescription)}
                      placeholder="Multiple passes, with every cut, layer, and effect double-checked..."
                      className="w-full text-xs sm:text-sm text-zinc-700 font-normal leading-relaxed bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-zinc-900 resize-y"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 3: ABOUT ME (VISUAL REPLICA)                             */}
      {/* ================================================================ */}
      {activeSection === 'about' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs font-mono text-zinc-500">
            <span>VISUAL REPLICA // ABOUT ME SECTION</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Single-Ruler Visual Layout
            </span>
          </div>

          {/* Authentic Studio About Container */}
          <div className="relative rounded-3xl bg-[#fafafa] text-zinc-900 p-6 sm:p-10 border border-zinc-200 shadow-sm overflow-hidden space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              
              {/* Left Column: Clear Single Ruler Headline */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span>COMMANDING HEADLINE</span>
                  {renderMeter((form.aboutHeading || '').length, LIMITS.aboutHeading)}
                </div>
                <textarea
                  rows={3}
                  value={form.aboutHeading || 'Background & Approach'}
                  maxLength={LIMITS.aboutHeading}
                  onChange={(e) => handleChange('aboutHeading', e.target.value, LIMITS.aboutHeading)}
                  className="w-full font-display text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 leading-[1.12] bg-white border border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 rounded-2xl p-4 focus:outline-none transition-all resize-y"
                  placeholder="Background & Approach"
                />
                <p className="text-[11px] text-zinc-400 font-mono">
                  The sole governing title anchor for the About Me section.
                </p>
              </div>

              {/* Right Column: Narrative Body & Minimalist Floating Tools */}
              <div className="lg:col-span-7 space-y-4">
                {/* Paragraph 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span>BIO PARAGRAPH 1</span>
                    {renderMeter((form.aboutBio1 || '').length, LIMITS.aboutBio1)}
                  </div>
                  <textarea
                    rows={4}
                    value={form.aboutBio1}
                    maxLength={LIMITS.aboutBio1}
                    onChange={(e) => handleChange('aboutBio1', e.target.value, LIMITS.aboutBio1)}
                    className="w-full text-zinc-700 text-sm sm:text-base leading-relaxed bg-white border border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 rounded-2xl p-4 focus:outline-none transition-all resize-y"
                  />
                </div>

                {/* Paragraph 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span>BIO PARAGRAPH 2</span>
                    {renderMeter((form.aboutBio2 || '').length, LIMITS.aboutBio2)}
                  </div>
                  <textarea
                    rows={4}
                    value={form.aboutBio2}
                    maxLength={LIMITS.aboutBio2}
                    onChange={(e) => handleChange('aboutBio2', e.target.value, LIMITS.aboutBio2)}
                    className="w-full text-zinc-600 text-sm sm:text-base leading-relaxed bg-white border border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 rounded-2xl p-4 focus:outline-none transition-all resize-y"
                  />
                </div>

                {/* Paragraph 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span>BIO PARAGRAPH 3</span>
                    {renderMeter((form.aboutBio3 || '').length, LIMITS.aboutBio3)}
                  </div>
                  <textarea
                    rows={4}
                    value={form.aboutBio3 || ''}
                    maxLength={LIMITS.aboutBio3}
                    onChange={(e) => handleChange('aboutBio3', e.target.value, LIMITS.aboutBio3)}
                    placeholder="Third bio paragraph (optional narrative or philosophy statement)..."
                    className="w-full text-zinc-600 text-sm sm:text-base leading-relaxed bg-white border border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 rounded-2xl p-4 focus:outline-none transition-all resize-y"
                  />
                </div>

                {/* Core Tools Bar - Floating without box containers, cleanly aligned */}
                <div className="pt-4 border-t border-zinc-200">
                  <span className="block text-zinc-400 font-mono text-[10px] uppercase tracking-widest font-semibold mb-3">
                    CORE TOOLS
                  </span>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 font-mono text-xs sm:text-sm text-zinc-800">
                    {(form.aboutTools && form.aboutTools.length > 0
                      ? form.aboutTools
                      : ['Premiere Pro', 'After Effects', 'Photoshop', 'YouTube Studio']
                    ).map((tool, idx) => (
                      <span key={idx} className="flex items-center gap-2 font-medium tracking-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 4: SOCIAL PROFILES & FOOTER LINKS                       */}
      {/* ================================================================ */}
      {activeSection === 'socials' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#fafafa] border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900 flex items-center gap-2">
                <span>Social Profiles &amp; Quick Contact Links</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Global Footer Links
                </span>
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-1">
                Configure direct URLs for the footer action buttons (Instagram, LinkedIn, X/Twitter, Gmail).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                Instagram URL
              </label>
              <input
                type="text"
                value={form.socialInstagram || ''}
                onChange={(e) => handleChange('socialInstagram', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
              <p className="text-[10px] text-zinc-400">Direct link to your Instagram profile</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={form.socialLinkedin || ''}
                onChange={(e) => handleChange('socialLinkedin', e.target.value)}
                placeholder="https://linkedin.com/in/yourhandle"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
              <p className="text-[10px] text-zinc-400">Direct link to your LinkedIn profile</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                X (Twitter) URL
              </label>
              <input
                type="text"
                value={form.socialX || ''}
                onChange={(e) => handleChange('socialX', e.target.value)}
                placeholder="https://x.com/yourhandle"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
              <p className="text-[10px] text-zinc-400">Direct link to your X account</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                Primary Gmail / Contact Address
              </label>
              <input
                type="text"
                value={form.socialGmail || ''}
                onChange={(e) => handleChange('socialGmail', e.target.value)}
                placeholder="zolepto@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
              <p className="text-[10px] text-zinc-400">Primary contact address (zolepto@gmail.com)</p>
            </div>

            {/* Web3Forms Instant Email Forwarding */}
            <div className="space-y-1.5 sm:col-span-2 pt-3 border-t border-zinc-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-700">
                  Web3Forms Access Key
                </label>
                <a
                  href="https://web3forms.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-zinc-500 hover:text-zinc-900 underline font-mono"
                >
                  Get free key at web3forms.com ↗
                </a>
              </div>
              <input
                type="text"
                value={form.web3formsAccessKey || ''}
                onChange={(e) => handleChange('web3formsAccessKey', e.target.value)}
                placeholder="cce7d17a-a640-443a-b066-33c06020b08e"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
              <p className="text-[10px] text-zinc-500">
                Inquiries are sent via Web3Forms directly to your verified inbox (<strong className="font-mono text-zinc-800">zolepto@gmail.com</strong>) with dual honeypot traps and anti-spam protection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 5: LET'S CREATE (FIXED CONSULTATION FUNNEL)              */}
      {/* ================================================================ */}
      {activeSection === 'consultation' && (
        <div className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900">
                Let's Create Together (Consultation Section)
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Standardized intake structure • Fixed by architectural design
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs text-zinc-600">
            <p className="font-semibold text-zinc-900">
              Why is this section locked?
            </p>
            <p className="leading-relaxed">
              As specified in the editorial blueprint guidelines, the "Let's Create Together" consultation booking funnel is strictly preserved to ensure guaranteed form delivery to{' '}
              <strong className="font-mono text-zinc-900">{form.contactEmail || 'zolepto@gmail.com'}</strong> and avoid breakages with prospective clients.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Inquiries auto-forward directly to your verified address.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
