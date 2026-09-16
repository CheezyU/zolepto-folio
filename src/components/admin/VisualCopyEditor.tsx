import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Send,
  Lock,
  ArrowUpRight,
  Sliders,
  Scissors,
  Volume2,
  Eye,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { DEFAULT_SITE_SETTINGS } from '../../services/siteSettingsService';

interface VisualCopyEditorProps {
  settings: SiteSettings;
  onPublishToGitHub: (updated: SiteSettings) => Promise<void>;
  isPublishing: boolean;
  status: { type: 'success' | 'error'; text: string } | null;
}

type EditorSection = 'hero' | 'about' | 'workshop' | 'socials' | 'consultation';

export const VisualCopyEditor: React.FC<VisualCopyEditorProps> = ({
  settings: initialSettings,
  onPublishToGitHub,
  isPublishing,
  status,
}) => {
  const [form, setForm] = useState<SiteSettings>({ ...initialSettings });
  const [activeSection, setActiveSection] = useState<EditorSection>('hero');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setForm({ ...initialSettings });
  }, [initialSettings]);

  // Safety length limits configuration
  const LIMITS = {
    heroTitleLine1: 45,
    heroTitleLine2: 45,
    heroSubtitle: 220,
    availabilityStatus: 45,
    aboutQuote: 180,
    aboutBio1: 300,
    aboutBio2: 300,
    contactEmail: 60,
    workshopHeading: 45,
    workshopSubtitle: 200,
    stepTitle: 40,
    stepSubtitle: 55,
    stepDescription: 280,
    stepNote: 95,
  };

  const handleChange = (field: keyof SiteSettings, value: any, maxLength?: number) => {
    let finalVal = value;
    if (maxLength && typeof value === 'string' && value.length > maxLength) {
      finalVal = value.slice(0, maxLength);
    }
    setForm((prev) => ({ ...prev, [field]: finalVal }));
    setHasChanges(true);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all copy to default editorial studio text?')) {
      setForm({ ...DEFAULT_SITE_SETTINGS });
      setHasChanges(true);
    }
  };

  const handlePublish = async () => {
    await onPublishToGitHub(form);
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
              ? 'text-rose-600 font-bold'
              : isClose
              ? 'text-amber-600 font-medium'
              : 'text-zinc-400'
          }
        >
          {currentLength}/{max}
        </span>
        <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
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
              Live WYSIWYG
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Visual in-context editing that mirrors the actual website design. Includes safety constraints to prevent typography breakage.
          </p>
        </div>

        {/* Action Controls: ONE SINGLE MASTER BUTTON */}
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
            title="Commit and publish all changes directly to GitHub"
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
          { id: 'hero', label: '01. Hero & Identity', icon: Globe },
          { id: 'about', label: '02. About Story & Bio', icon: Sparkles },
          { id: 'workshop', label: '03. Workshop Blueprint', icon: Layers },
          { id: 'socials', label: '04. Social Links', icon: Share2 },
          { id: 'consultation', label: "05. Let's Create (Fixed)", icon: Lock },
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
      {/* SECTION 1: HERO & IDENTITY (VISUAL REPLICA)                     */}
      {/* ================================================================ */}
      {activeSection === 'hero' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#fafafa] border border-zinc-200 shadow-sm relative overflow-hidden">
            {/* Visual Header Note */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-200 text-xs font-mono text-zinc-400">
              <span>VISUAL REPLICA // HERO SECTION</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Direct Inline Editing Enabled
              </span>
            </div>

            {/* Live Availability Status Pill Control */}
            <div className="space-y-2 mb-8 max-w-md">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="font-semibold text-zinc-700">Live Availability Status Pill</span>
                {renderMeter(form.availabilityStatus.length, LIMITS.availabilityStatus)}
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 shadow-2xs w-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <input
                  type="text"
                  value={form.availabilityStatus}
                  maxLength={LIMITS.availabilityStatus}
                  onChange={(e) =>
                    handleChange('availabilityStatus', e.target.value, LIMITS.availabilityStatus)
                  }
                  placeholder="e.g. Available for incoming projects!"
                  className="bg-transparent border-none text-xs font-mono text-zinc-800 focus:outline-none w-full"
                />
              </div>
              <p className="text-[10px] text-zinc-400">
                Displayed prominently at the top badge of your homepage.
              </p>
            </div>

            {/* Hero Headline Line 1 */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="font-semibold text-zinc-700">Headline (Line 1 - Bold Display)</span>
                {renderMeter(form.heroTitleLine1.length, LIMITS.heroTitleLine1)}
              </div>
              <input
                type="text"
                value={form.heroTitleLine1}
                maxLength={LIMITS.heroTitleLine1}
                onChange={(e) =>
                  handleChange('heroTitleLine1', e.target.value, LIMITS.heroTitleLine1)
                }
                className="w-full font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 bg-white px-4 py-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
            </div>

            {/* Hero Headline Line 2 */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="font-semibold text-zinc-700">Headline (Line 2 - Muted Display)</span>
                {renderMeter(form.heroTitleLine2.length, LIMITS.heroTitleLine2)}
              </div>
              <input
                type="text"
                value={form.heroTitleLine2}
                maxLength={LIMITS.heroTitleLine2}
                onChange={(e) =>
                  handleChange('heroTitleLine2', e.target.value, LIMITS.heroTitleLine2)
                }
                className="w-full font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-500 bg-white px-4 py-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
            </div>

            {/* Hero Narrative Subtitle */}
            <div className="space-y-2 mb-8">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="font-semibold text-zinc-700">Narrative Subtitle (Max 220 Chars)</span>
                {renderMeter(form.heroSubtitle.length, LIMITS.heroSubtitle)}
              </div>
              <textarea
                rows={3}
                value={form.heroSubtitle}
                maxLength={LIMITS.heroSubtitle}
                onChange={(e) =>
                  handleChange('heroSubtitle', e.target.value, LIMITS.heroSubtitle)
                }
                className="w-full text-base sm:text-lg text-zinc-600 leading-relaxed bg-white p-4 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
            </div>

            {/* Direct Contact Email */}
            <div className="space-y-2 max-w-sm pt-4 border-t border-zinc-200">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="font-semibold text-zinc-700">Direct Contact Email</span>
                {renderMeter(form.contactEmail.length, LIMITS.contactEmail)}
              </div>
              <input
                type="email"
                value={form.contactEmail}
                maxLength={LIMITS.contactEmail}
                onChange={(e) =>
                  handleChange('contactEmail', e.target.value, LIMITS.contactEmail)
                }
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 2: ABOUT & PHILOSOPHY STORY                             */}
      {/* ================================================================ */}
      {activeSection === 'about' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#fafafa] border border-zinc-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-200 text-xs font-mono text-zinc-400">
              <span>VISUAL REPLICA // ABOUT & EDITORIAL CRAFT</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Preserves High-Retention Typography
              </span>
            </div>

            {/* Philosophy Quote */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="font-semibold text-zinc-700">Philosophy Blockquote</span>
                {renderMeter(form.aboutQuote.length, LIMITS.aboutQuote)}
              </div>
              <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs border-l-4 border-l-zinc-950">
                <textarea
                  rows={2}
                  value={form.aboutQuote}
                  maxLength={LIMITS.aboutQuote}
                  onChange={(e) =>
                    handleChange('aboutQuote', e.target.value, LIMITS.aboutQuote)
                  }
                  className="w-full font-display text-lg sm:text-xl text-zinc-950 font-medium leading-snug bg-transparent border-none focus:outline-none"
                />
              </div>
            </div>

            {/* Bio Paragraph 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="font-semibold text-zinc-700">
                  Bio Paragraph 1 (Timeline Background & Retention Craft)
                </span>
                {renderMeter(form.aboutBio1.length, LIMITS.aboutBio1)}
              </div>
              <textarea
                rows={3}
                value={form.aboutBio1}
                maxLength={LIMITS.aboutBio1}
                onChange={(e) =>
                  handleChange('aboutBio1', e.target.value, LIMITS.aboutBio1)
                }
                className="w-full text-zinc-700 text-sm sm:text-base leading-relaxed bg-white p-4 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
            </div>

            {/* Bio Paragraph 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="font-semibold text-zinc-700">
                  Bio Paragraph 2 (1-on-1 Direct Partnership Model)
                </span>
                {renderMeter(form.aboutBio2.length, LIMITS.aboutBio2)}
              </div>
              <textarea
                rows={3}
                value={form.aboutBio2}
                maxLength={LIMITS.aboutBio2}
                onChange={(e) =>
                  handleChange('aboutBio2', e.target.value, LIMITS.aboutBio2)
                }
                className="w-full text-zinc-700 text-sm sm:text-base leading-relaxed bg-white p-4 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
            </div>

            {/* Locked Visual Craft Specs Bar */}
            <div className="p-4 rounded-2xl bg-zinc-100/80 border border-zinc-200 text-xs font-mono text-zinc-500 space-y-1">
              <span className="font-semibold text-zinc-700 block">
                ✦ Hardware Specs & Craft Anchor:
              </span>
              <p className="text-[11px] text-zinc-400">
                Premiere & DaVinci • YRGB 35mm Emulation • Logic Pro & Stems • High-CTR Key-Art.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 3: WORKSHOP BLUEPRINT STEPS (VISUAL REPLICA)            */}
      {/* ================================================================ */}
      {activeSection === 'workshop' && (
        <div className="space-y-8">
          {/* Blueprint Intro Header */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#fafafa] border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 text-xs font-mono text-zinc-400">
              <span>VISUAL REPLICA // WORKSHOP DRAFTING SHEET</span>
              <span className="text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded font-mono text-[10px]">
                4-PHASE PROGRESSION
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-1">
                  <span className="font-semibold text-zinc-700">Workshop Main Heading</span>
                  {renderMeter((form.workshopHeading || '').length, LIMITS.workshopHeading)}
                </div>
                <input
                  type="text"
                  value={form.workshopHeading || 'How the story unfolds.'}
                  maxLength={LIMITS.workshopHeading}
                  onChange={(e) =>
                    handleChange('workshopHeading', e.target.value, LIMITS.workshopHeading)
                  }
                  className="w-full font-display text-2xl sm:text-3xl font-bold text-zinc-950 bg-white p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-1">
                  <span className="font-semibold text-zinc-700">Workshop Narrative Subtitle</span>
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
                  className="w-full text-xs sm:text-sm text-zinc-600 leading-relaxed bg-white p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Phase 01: Identifying You */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-white font-mono text-[10px] font-bold">
                  01
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  [ PHASE 01 // SIGNAL EXTRACTION ]
                </span>
              </div>
              <span className="font-handwriting text-base text-emerald-700 font-semibold">
                ✦ user favorite core step
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                  <span>Phase Title</span>
                  {renderMeter((form.step1Title || '').length, LIMITS.stepTitle)}
                </label>
                <input
                  type="text"
                  value={form.step1Title || 'Identifying You'}
                  maxLength={LIMITS.stepTitle}
                  onChange={(e) => handleChange('step1Title', e.target.value, LIMITS.stepTitle)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                  <span>Phase Subtitle</span>
                  {renderMeter((form.step1Subtitle || '').length, LIMITS.stepSubtitle)}
                </label>
                <input
                  type="text"
                  value={form.step1Subtitle || 'The Core Signal & Creative DNA'}
                  maxLength={LIMITS.stepSubtitle}
                  onChange={(e) =>
                    handleChange('step1Subtitle', e.target.value, LIMITS.stepSubtitle)
                  }
                  className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                <span>Phase Description</span>
                {renderMeter((form.step1Description || '').length, LIMITS.stepDescription)}
              </label>
              <textarea
                rows={3}
                value={
                  form.step1Description ||
                  'Before a single clip is dragged to the timeline or a cut is made, we identify you. Who you are, what your voice stands for, who your real audience is, and the psychological hook that makes your content undeniably yours. We don’t copy trends or use cookie-cutter templates—we locate your authentic edge and reverse-engineer the entire narrative around it.'
                }
                maxLength={LIMITS.stepDescription}
                onChange={(e) =>
                  handleChange('step1Description', e.target.value, LIMITS.stepDescription)
                }
                className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                <span>Handwritten Director Note</span>
                {renderMeter((form.step1Note || '').length, LIMITS.stepNote)}
              </label>
              <input
                type="text"
                value={
                  form.step1Note ||
                  '“Who you are > fancy transitions. This is where real retention is born.”'
                }
                maxLength={LIMITS.stepNote}
                onChange={(e) => handleChange('step1Note', e.target.value, LIMITS.stepNote)}
                className="w-full p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 font-handwriting text-lg text-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Phase 02: Narrative Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-white font-mono text-[10px] font-bold">
                  02
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  [ PHASE 02 // THE BREAKDOWN ]
                </span>
              </div>
              <span className="font-handwriting text-base text-rose-700 font-semibold">
                ✂ the breakdown begins
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                  <span>Phase Title</span>
                  {renderMeter((form.step2Title || '').length, LIMITS.stepTitle)}
                </label>
                <input
                  type="text"
                  value={form.step2Title || 'Deconstructing the Narrative'}
                  maxLength={LIMITS.stepTitle}
                  onChange={(e) => handleChange('step2Title', e.target.value, LIMITS.stepTitle)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                  <span>Phase Subtitle</span>
                  {renderMeter((form.step2Subtitle || '').length, LIMITS.stepSubtitle)}
                </label>
                <input
                  type="text"
                  value={form.step2Subtitle || 'Ruthless Dissection & Trimming the Fat'}
                  maxLength={LIMITS.stepSubtitle}
                  onChange={(e) =>
                    handleChange('step2Subtitle', e.target.value, LIMITS.stepSubtitle)
                  }
                  className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                <span>Phase Description</span>
                {renderMeter((form.step2Description || '').length, LIMITS.stepDescription)}
              </label>
              <textarea
                rows={3}
                value={
                  form.step2Description ||
                  'Every raw timeline is bloated with comfort footage and dead air. We break your narrative down to its absolute bare skeleton. Dissecting the raw rushes, unearthing unexpected gold in second takes, and mapping out the viewer retention curve. Every single second on the timeline must justify its existence or get cut. It’s an intentional, honest breakdown until only pure substance remains.'
                }
                maxLength={LIMITS.stepDescription}
                onChange={(e) =>
                  handleChange('step2Description', e.target.value, LIMITS.stepDescription)
                }
                className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                <span>Handwritten Director Note</span>
                {renderMeter((form.step2Note || '').length, LIMITS.stepNote)}
              </label>
              <input
                type="text"
                value={
                  form.step2Note ||
                  '✂ Cut the safety filler. If it doesn’t push the story forward, it dies here.'
                }
                maxLength={LIMITS.stepNote}
                onChange={(e) => handleChange('step2Note', e.target.value, LIMITS.stepNote)}
                className="w-full p-2.5 rounded-xl bg-rose-50/50 border border-rose-200 font-handwriting text-lg text-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Phase 03: Emotional Rhythm & Sound */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-white font-mono text-[10px] font-bold">
                  03
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  [ PHASE 03 // ACOUSTIC ARCHITECTURE ]
                </span>
              </div>
              <span className="font-handwriting text-base text-indigo-700 font-semibold">
                ♫ 40Hz sub-bass layer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                  <span>Phase Title</span>
                  {renderMeter((form.step3Title || '').length, LIMITS.stepTitle)}
                </label>
                <input
                  type="text"
                  value={form.step3Title || 'Emotional Rhythm & Subconscious Sound'}
                  maxLength={LIMITS.stepTitle}
                  onChange={(e) => handleChange('step3Title', e.target.value, LIMITS.stepTitle)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                  <span>Phase Subtitle</span>
                  {renderMeter((form.step3Subtitle || '').length, LIMITS.stepSubtitle)}
                </label>
                <input
                  type="text"
                  value={form.step3Subtitle || 'The Kinetic Pulse & Visceral Foley'}
                  maxLength={LIMITS.stepSubtitle}
                  onChange={(e) =>
                    handleChange('step3Subtitle', e.target.value, LIMITS.stepSubtitle)
                  }
                  className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                <span>Phase Description</span>
                {renderMeter((form.step3Description || '').length, LIMITS.stepDescription)}
              </label>
              <textarea
                rows={3}
                value={
                  form.step3Description ||
                  'Pacing isn’t raw speed—it’s tension, breath, and release. We sculpt the cut to an auditory heartbeat: layering subconscious micro-risers, tactile foley, deep sub-bass drops, and room ambience that viewers feel in their chest before their eyes even register it. Audio carries 70% of cinematic perception; we treat sound as equal to the picture.'
                }
                maxLength={LIMITS.stepDescription}
                onChange={(e) =>
                  handleChange('step3Description', e.target.value, LIMITS.stepDescription)
                }
                className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                <span>Handwritten Director Note</span>
                {renderMeter((form.step3Note || '').length, LIMITS.stepNote)}
              </label>
              <input
                type="text"
                value={
                  form.step3Note ||
                  'Subconscious audio cues [40Hz - 12kHz] — feel it in the headphones 🎧'
                }
                maxLength={LIMITS.stepNote}
                onChange={(e) => handleChange('step3Note', e.target.value, LIMITS.stepNote)}
                className="w-full p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200 font-handwriting text-lg text-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Phase 04: Visual Prestige & Delivery */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-white font-mono text-[10px] font-bold">
                  04
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  [ PHASE 04 // MASTER POLISH & LAUNCH ]
                </span>
              </div>
              <span className="font-handwriting text-base text-amber-700 font-semibold">
                ✓ export locked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                  <span>Phase Title</span>
                  {renderMeter((form.step4Title || '').length, LIMITS.stepTitle)}
                </label>
                <input
                  type="text"
                  value={form.step4Title || 'Visual Prestige & Delivery'}
                  maxLength={LIMITS.stepTitle}
                  onChange={(e) => handleChange('step4Title', e.target.value, LIMITS.stepTitle)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                  <span>Phase Subtitle</span>
                  {renderMeter((form.step4Subtitle || '').length, LIMITS.stepSubtitle)}
                </label>
                <input
                  type="text"
                  value={form.step4Subtitle || 'Color Science, Key-Art & Cultural Authority'}
                  maxLength={LIMITS.stepSubtitle}
                  onChange={(e) =>
                    handleChange('step4Subtitle', e.target.value, LIMITS.stepSubtitle)
                  }
                  className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                <span>Phase Description</span>
                {renderMeter((form.step4Description || '').length, LIMITS.stepDescription)}
              </label>
              <textarea
                rows={3}
                value={
                  form.step4Description ||
                  'The final synthesis. Film-grade DaVinci color science with custom highlight rolloff, skin-tone preservation, kinetic typography, and high-CTR thumbnail packaging that stops the infinite scroll. When we export, your project looks and sounds like a studio production that commands immediate respect and builds long-term authority.'
                }
                maxLength={LIMITS.stepDescription}
                onChange={(e) =>
                  handleChange('step4Description', e.target.value, LIMITS.stepDescription)
                }
                className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1 flex justify-between">
                <span>Handwritten Director Note</span>
                {renderMeter((form.step4Note || '').length, LIMITS.stepNote)}
              </label>
              <input
                type="text"
                value={
                  form.step4Note ||
                  '✦ Ready for export. Approved for master release across all formats.'
                }
                maxLength={LIMITS.stepNote}
                onChange={(e) => handleChange('step4Note', e.target.value, LIMITS.stepNote)}
                className="w-full p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 font-handwriting text-lg text-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 4: SOCIAL PROFILES & DIRECT FOOTER BUTTONS              */}
      {/* ================================================================ */}
      {activeSection === 'socials' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#fafafa] border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900 flex items-center gap-2">
                <span>Social Profiles & Quick Contact Links</span>
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
                Gmail / Contact Address
              </label>
              <input
                type="text"
                value={form.socialGmail || ''}
                onChange={(e) => handleChange('socialGmail', e.target.value)}
                placeholder="cheddarc19@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
              <p className="text-[10px] text-zinc-400">Used for direct Gmail composer links</p>
            </div>

            {/* FormSubmit Instant Email Forwarding */}
            <div className="space-y-1.5 sm:col-span-2 pt-3 border-t border-zinc-200">
              <label className="block text-xs font-semibold text-zinc-700">
                FormSubmit Inquiry Forwarding Email
              </label>
              <input
                type="email"
                value={form.formsubmitEmail || ''}
                onChange={(e) => handleChange('formsubmitEmail', e.target.value)}
                placeholder="cheddarc19@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900 shadow-2xs"
              />
              <p className="text-[10px] text-zinc-500">
                Every client brief is sent directly to this address via FormSubmit so you receive instant phone alerts via your Gmail app.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SECTION 5: LET'S CREATE TOGETHER (FIXED DESIGN NOTICE)          */}
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
              <strong className="font-mono text-zinc-900">{form.contactEmail}</strong> and avoid breakages with prospective clients.
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
