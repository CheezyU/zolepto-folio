import React, { useEffect, useState } from 'react';
import { Play, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteSettings } from '../types';
import { cleanImageUrl, isImgbbViewerUrl, resolveImgbbViewerUrl } from '../lib/imageUtils';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
  onPlayFeatured: () => void;
  settings?: SiteSettings;
}

const INTRO_SESSION_KEY = 'zolepto_hero_intro_animated';

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onPlayFeatured,
  settings,
}) => {
  const line1 = settings?.heroTitleLine1 || 'Your visual storyteller';
  const line2 = settings?.heroTitleLine2 || '& content creation director.';
  const subtitle =
    settings?.heroSubtitle ||
    'I craft high-retention commercial cuts, cinematic narratives, and digital formats where every single frame earns its place. Direct 1-on-1 collaboration that makes your work impossible to ignore.';
  const availability = settings?.availabilityStatus || 'Available for incoming projects!';
  const showDot = settings?.showAvailabilityDot ?? true;
  const profilePic = settings?.profilePictureUrl;

  // Single-session intro animation flag: only animates once per browser session
  const [shouldAnimateIntro, setShouldAnimateIntro] = useState<boolean>(() => {
    try {
      const hasAnimated = sessionStorage.getItem(INTRO_SESSION_KEY);
      return !hasAnimated;
    } catch {
      return false;
    }
  });

  // ImgBB auto-resolution and error handling
  const [resolvedPic, setResolvedPic] = useState<string>(() => cleanImageUrl(profilePic || ''));
  const [imgError, setImgError] = useState(false);

  // Mark session intro as completed
  useEffect(() => {
    if (shouldAnimateIntro) {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
      } catch {}
    }
  }, [shouldAnimateIntro]);

  // Listen for manual intro replay trigger (e.g. from admin panel)
  useEffect(() => {
    const handleReplay = () => {
      try {
        sessionStorage.removeItem(INTRO_SESSION_KEY);
      } catch {}
      setShouldAnimateIntro(true);
    };
    window.addEventListener('zolepto:replay_intro', handleReplay);
    return () => window.removeEventListener('zolepto:replay_intro', handleReplay);
  }, []);

  // Resolve ImgBB links (handles direct links, embed codes, BBCode, viewer links, thumbnails)
  useEffect(() => {
    let active = true;
    setImgError(false);

    if (!profilePic) {
      setResolvedPic('');
      return;
    }

    const cleaned = cleanImageUrl(profilePic);
    setResolvedPic(cleaned);

    // If it's an ImgBB viewer link (e.g. ibb.co/xyz without i.ibb.co), resolve to direct image
    if (isImgbbViewerUrl(cleaned) || isImgbbViewerUrl(profilePic)) {
      resolveImgbbViewerUrl(cleaned || profilePic)
        .then((direct) => {
          if (active && direct && direct !== cleaned) {
            setResolvedPic(direct);
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [profilePic]);

  return (
    <section
      id="hero"
      className="relative pt-24 sm:pt-40 pb-20 sm:pb-40 overflow-hidden bg-[#0d0e13] text-zinc-100 z-10"
    >
      {/* Upper Page Studio Atmosphere & Creator Backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Cinematic dark studio photo layer */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transform duration-1000"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=2000&q=80)',
          }}
        />

        {/* Studio radial spotlight and gradient vignetting */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e13] via-[#0d0e13]/85 to-[#0d0e13]/95" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0e13]/50 via-transparent to-[#0d0e13]" />

        {/* Subtle luminous warm amber and slate glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[380px] bg-amber-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[480px] h-[340px] bg-indigo-500/10 blur-[140px] rounded-full" />

        {/* Blueprint fine grid overlay */}
        <div className="absolute inset-0 blueprint-dots opacity-20" />

        {/* Downward gradient and depth shadow into the overlapping lower page */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-b from-transparent via-[#0d0e13]/80 to-black pointer-events-none" />
      </div>

      {/* ONE-TIME RETENTION GRAPH INTRO ANIMATION: Rising from low to high */}
      {shouldAnimateIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 0.4] }}
          transition={{ duration: 2.2, times: [0, 0.6, 1] }}
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center"
        >
          {/* Subtle retention grid markings */}
          <div className="absolute inset-0 flex flex-col justify-between py-12 px-6 sm:px-14 opacity-15">
            <div className="w-full border-b border-dashed border-emerald-400/40 flex justify-between text-[10px] font-mono text-emerald-400">
              <span>100% // PEAK AUDIENCE RETENTION</span>
              <span>HIGH-CTR TIMELINE</span>
            </div>
            <div className="w-full border-b border-dashed border-white/20 flex justify-between text-[10px] font-mono text-zinc-500">
              <span>75% // PACING SPIKE & TENSION</span>
              <span>ZERO DROP-OFF</span>
            </div>
            <div className="w-full border-b border-dashed border-white/20 flex justify-between text-[10px] font-mono text-zinc-500">
              <span>50% // BENCHMARK RETENTION</span>
              <span>CONTINUOUS MOMENTUM</span>
            </div>
            <div className="w-full border-b border-dashed border-white/20 flex justify-between text-[10px] font-mono text-zinc-600">
              <span>0% // BASELINE (TIMELINE START)</span>
              <span>0:00 — 1:00</span>
            </div>
          </div>

          {/* Cinematic Rising Retention SVG Curve */}
          <svg
            viewBox="0 0 1200 480"
            preserveAspectRatio="none"
            className="w-full h-full max-h-[520px] overflow-visible"
          >
            <defs>
              <linearGradient id="retentionStroke" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#10b981" stopOpacity="1" />
                <stop offset="70%" stopColor="#06b6d4" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="retentionFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#0d0e13" stopOpacity="0" />
              </linearGradient>
              <filter id="retentionGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Rising Area Gradient Fill Under Curve */}
            <motion.path
              d="M 0,440 C 140,430 220,380 340,160 C 440,90 560,110 680,75 C 800,45 940,60 1060,40 C 1140,25 1180,30 1200,28 L 1200,480 L 0,480 Z"
              fill="url(#retentionFill)"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'bottom' }}
            />

            {/* Main Rising Retention Graph Line: sweeping from low to high */}
            <motion.path
              d="M 0,440 C 140,430 220,380 340,160 C 440,90 560,110 680,75 C 800,45 940,60 1060,40 C 1140,25 1180,30 1200,28"
              fill="none"
              stroke="url(#retentionStroke)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#retentionGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          {/* Glowing Retention Milestone Badge */}
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.85 }}
            animate={{ opacity: [0, 1, 1, 0.85], y: -25, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/4 right-6 sm:right-20 hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 backdrop-blur-md text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] select-none pointer-events-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
              Retention Surge ▲ +91.4%
            </span>
          </motion.div>
        </motion.div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-center">
          
          {/* Left Column: Bold Display Typography, Narrative, CTAs & Metrics (HEADLINE COMES IN FIRST) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left order-last lg:order-first">
            {/* 1. HEADLINE COMES IN FIRST */}
            <motion.div
              initial={
                shouldAnimateIntro
                  ? { opacity: 0, y: 30, filter: 'blur(12px)' }
                  : { opacity: 1, y: 0, filter: 'blur(0px)' }
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: shouldAnimateIntro ? 0.85 : 0.3,
                delay: shouldAnimateIntro ? 0.95 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12]">
                {line1} <br />
                <span className="text-zinc-400 font-semibold">{line2}</span>
              </h1>
            </motion.div>

            {/* Breathable narrative description */}
            <motion.p
              initial={
                shouldAnimateIntro
                  ? { opacity: 0, y: 20, filter: 'blur(8px)' }
                  : { opacity: 1, y: 0, filter: 'blur(0px)' }
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: shouldAnimateIntro ? 0.8 : 0.3,
                delay: shouldAnimateIntro ? 1.15 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-xs sm:text-base md:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 font-body leading-relaxed font-normal"
            >
              {subtitle}
            </motion.p>

            {/* Primary Actions */}
            <motion.div
              initial={
                shouldAnimateIntro
                  ? { opacity: 0, y: 16 }
                  : { opacity: 1, y: 0 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldAnimateIntro ? 0.7 : 0.3,
                delay: shouldAnimateIntro ? 1.75 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="pt-1 sm:pt-2 flex flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 relative"
            >
              <button
                id="hero-play-reel-btn"
                onClick={onPlayFeatured}
                className="group inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-white text-zinc-950 font-semibold text-xs sm:text-sm tracking-wide hover:bg-zinc-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-950 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />
                </div>
                <span>Watch Showreel</span>
              </button>

              <button
                id="hero-start-cta"
                onClick={() => onNavigate('start')}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm tracking-wide font-semibold transition-all duration-200 hover:border-white/30 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
              </button>
            </motion.div>

            {/* 3. OUR STATS COME IN */}
            <motion.div
              initial={
                shouldAnimateIntro
                  ? { opacity: 0, y: 16 }
                  : { opacity: 1, y: 0 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldAnimateIntro ? 0.8 : 0.3,
                delay: shouldAnimateIntro ? 1.9 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="pt-4 sm:pt-5 border-t border-white/10 grid grid-cols-3 divide-x divide-white/10 text-center sm:text-left"
            >
              <div className="px-1.5 sm:px-0 space-y-0.5">
                <span className="block font-bold text-white font-display text-sm sm:text-lg tracking-tight">
                  {settings?.heroStat1Value || '14M+'}
                </span>
                <span className="block text-[10px] sm:text-xs font-mono text-zinc-400 leading-tight">
                  {settings?.heroStat1Label || 'Organic Views'}
                </span>
              </div>
              <div className="px-1.5 sm:pl-6 space-y-0.5">
                <span className="block font-bold text-white font-display text-sm sm:text-lg tracking-tight whitespace-nowrap">
                  {settings?.heroStat2Value || '4+ Years'}
                </span>
                <span className="block text-[9px] sm:text-xs font-mono text-zinc-400 leading-tight">
                  {settings?.heroStat2Label || 'Multimedia & Content Creation'}
                </span>
              </div>
              <div className="px-1.5 sm:pl-6 space-y-0.5">
                <span className="block font-bold text-white font-display text-sm sm:text-lg tracking-tight">
                  {settings?.heroStat3Value || '1-on-1'}
                </span>
                <span className="block text-[10px] sm:text-xs font-mono text-zinc-400 leading-tight">
                  {settings?.heroStat3Label || 'Direct Direction'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* 2. CREATOR PROFILE PICTURE COMES IN NEXT */}
          <motion.div
            initial={
              shouldAnimateIntro
                ? { opacity: 0, scale: 0.85, y: 20 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: shouldAnimateIntro ? 0.75 : 0.3,
              delay: shouldAnimateIntro ? 1.45 : 0,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="order-first lg:order-last lg:col-span-5 flex flex-col items-center justify-center lg:justify-end mb-4 lg:mb-0"
          >
            <div className="relative group flex flex-col items-center">
              {/* Circular profile container */}
              <div
                id="hero-profile-avatar-slot"
                className="relative w-36 h-36 sm:w-52 sm:h-52 lg:w-72 lg:h-72 rounded-full border-2 border-white/25 hover:border-white/50 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden ring-4 ring-white/10"
              >
                {/* Custom uploaded/embedded profile picture with ImgBB support & media protection */}
                {resolvedPic && !imgError ? (
                  <img
                    src={resolvedPic}
                    alt="Zolepto Hiraya — Director"
                    draggable={false}
                    data-protected-media="true"
                    onContextMenu={(e) => e.preventDefault()}
                    referrerPolicy="no-referrer"
                    onError={async () => {
                      if (resolvedPic && isImgbbViewerUrl(resolvedPic)) {
                        const direct = await resolveImgbbViewerUrl(resolvedPic);
                        if (direct && direct !== resolvedPic) {
                          setResolvedPic(direct);
                          return;
                        }
                      }
                      setImgError(true);
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                  />
                ) : (
                  <svg
                    className="w-full h-full text-zinc-400/50 hover:text-zinc-300/70 transition-colors transform translate-y-3 sm:translate-y-4"
                    viewBox="0 0 200 200"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Profile photo placeholder"
                  >
                    <circle cx="100" cy="74" r="34" />
                    <path d="M92 104H108V120H92z" />
                    <path d="M40 186 C40 142, 68 126, 100 126 C132 126, 160 142, 160 186 C160 192, 156 196, 150 196 H50 C44 196, 40 192, 40 186 Z" />
                  </svg>
                )}

                {/* Active status dot on avatar */}
                <div
                  className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-xs"
                  title="Online / Direct Direction"
                />
              </div>

              {/* Handdrawn Freeform Availability Status */}
              <motion.div
                initial={shouldAnimateIntro ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldAnimateIntro ? 0.6 : 0.3,
                  delay: shouldAnimateIntro ? 1.65 : 0,
                }}
                className="mt-3.5 sm:mt-4 flex items-center justify-center -rotate-2 sm:-rotate-3 hover:rotate-0 transition-transform duration-300 cursor-default select-none"
              >
                <div className="flex items-center gap-1.5 px-2 py-0.5 relative">
                  {showDot && (
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    </span>
                  )}
                  
                  {/* Freeform handwritten editorial script */}
                  <span className="font-handwriting text-lg sm:text-xl text-emerald-300 font-medium tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    {availability}
                  </span>

                  {/* Subtle hand-drawn sketchy arrow */}
                  <svg
                    className="w-5 h-5 text-emerald-400/90 -rotate-12 shrink-0 ml-0.5 opacity-80"
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
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
