import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '../types';
import { cleanImageUrl, isImgbbViewerUrl, resolveImgbbViewerUrl } from '../lib/imageUtils';
import { ROTATING_ROLES } from '../data/portfolioData';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
  onPlayFeatured: () => void;
  settings?: SiteSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onPlayFeatured,
  settings,
}) => {
  const line1 =
    settings?.heroTitleLine1 && settings.heroTitleLine1 !== 'Your visual storyteller'
      ? settings.heroTitleLine1
      : 'Editing is just the start.';
  const line2 =
    settings?.heroTitleLine2 && settings.heroTitleLine2 !== '& content creation director.'
      ? settings.heroTitleLine2
      : 'I care what happens after you hit post.';
  const defaultSubtitle =
    'I team up with creators and brands to build videos worth staying for, and an audience that actually comes back, not just views.';
  const subtitle =
    settings?.heroSubtitle &&
    !settings.heroSubtitle.includes('I craft high-retention commercial cuts') &&
    !settings.heroSubtitle.includes('Most editors chase retention with flashy edits') &&
    !settings.heroSubtitle.includes('Most editors chase high-retention metrics') &&
    !settings.heroSubtitle.includes('Most editors chase retention, but nobody asks') &&
    !settings.heroSubtitle.includes('I make videos worth staying for, so creators and brands')
      ? settings.heroSubtitle
      : defaultSubtitle;
  const availability = settings?.availabilityStatus || 'Available for incoming projects!';
  const showDot = settings?.showAvailabilityDot ?? true;
  const profilePic = settings?.profilePictureUrl;

  // Rotating roles element arching around the profile picture with identical delay (2800ms)
  const [roleIndex, setRoleIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROTATING_ROLES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // ImgBB auto-resolution and error handling
  const [resolvedPic, setResolvedPic] = useState<string>(() => cleanImageUrl(profilePic || ''));
  const [imgError, setImgError] = useState(false);

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
      className="relative pt-24 sm:pt-32 lg:pt-36 pb-28 sm:pb-36 lg:pb-40 overflow-hidden bg-[#0d0e13] text-zinc-100 z-10"
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

        {/* Downward gradient and depth shadow into the lower page - subtle and clear */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-[#0d0e13]/70 pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-center">
          
          {/* Left Column: Bold Display Typography, Narrative, CTAs & Metrics */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left order-last lg:order-first">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.12]">
                {line1}
              </h1>
              <span className="block mt-2.5 sm:mt-3.5 font-display text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-medium text-zinc-300 tracking-tight leading-snug">
                {line2}
              </span>
            </div>

            {/* Breathable narrative description */}
            <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto lg:mx-0 font-body leading-relaxed font-normal">
              {subtitle}
            </p>

            {/* Primary Actions */}
            <div className="pt-1 sm:pt-2 flex flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 relative">
              <button
                id="hero-play-reel-btn"
                onClick={onPlayFeatured}
                className="group inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-white text-zinc-950 font-semibold text-xs sm:text-sm tracking-wide hover:bg-zinc-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-950 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />
                </div>
                <span>Watch Video</span>
              </button>

              <button
                id="hero-start-cta"
                onClick={() => onNavigate('start')}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm tracking-wide font-semibold transition-all duration-200 hover:border-white/30 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
              </button>
            </div>

            {/* Credibility Metrics - Un-crushable, spacious, beautifully responsive */}
            <div className="pt-5 sm:pt-7 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-6 text-center sm:text-left">
              <div className="space-y-1">
                <span className="block font-bold text-white font-display text-base sm:text-2xl tracking-tight">
                  {settings?.heroStat1Value || '14M+'}
                </span>
                <span className="block text-[10.5px] sm:text-xs font-mono text-zinc-400 leading-snug">
                  {settings?.heroStat1Label || 'Organic Views'}
                </span>
              </div>
              <div className="border-l border-white/10 pl-2 sm:pl-6 space-y-1">
                <span className="block font-bold text-white font-display text-base sm:text-2xl tracking-tight whitespace-nowrap">
                  {settings?.heroStat2Value || '4+ Years'}
                </span>
                <span className="block text-[10.5px] sm:text-xs font-mono text-zinc-400 leading-snug">
                  {settings?.heroStat2Label || 'Multimedia & Content Creation'}
                </span>
              </div>
              <div className="border-l border-white/10 pl-2 sm:pl-6 space-y-1">
                <span className="block font-bold text-white font-display text-base sm:text-2xl tracking-tight">
                  {settings?.heroStat3Value || '1-on-1'}
                </span>
                <span className="block text-[10.5px] sm:text-xs font-mono text-zinc-400 leading-snug">
                  {settings?.heroStat3Label || 'Direct Direction'}
                </span>
              </div>
            </div>
          </div>

          {/* Creator Profile Avatar Column - Generous mobile sizing, zero squeeze */}
          <div className="order-first lg:order-last lg:col-span-5 flex flex-col items-center justify-center lg:justify-end mb-6 sm:mb-8 lg:mb-0 pt-2 sm:pt-0">
            <div className="relative group flex flex-col items-center">
              {/* Avatar Frame with Arched Rotating Roles Component */}
              <div className="relative flex items-center justify-center pt-2 sm:pt-4">
                {/* Arched Rotating Role Indicator wrapping the top curve of avatar */}
                <div
                  className="absolute -inset-6 sm:-inset-7 lg:-inset-9 pointer-events-none select-none z-20 overflow-visible flex items-center justify-center"
                  aria-label="Current role"
                >
                  <svg
                    viewBox="0 0 320 320"
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      {/* Upper arch path following the circular contour of the avatar */}
                      <path
                        id="heroAvatarRoleArc"
                        d="M 22,160 A 138,138 0 0,1 298,160"
                        fill="none"
                      />
                    </defs>

                    {/* Subtle blueprint dashed orbit track */}
                    <path
                      d="M 30,160 A 130,130 0 0,1 290,160"
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                      strokeDasharray="3 4"
                    />

                    {/* Dynamic Arched Role text synchronized with footer (same 2800ms delay, smooth in/out) */}
                    <AnimatePresence mode="wait">
                      <motion.g
                        key={roleIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <text
                          className="fill-zinc-100 text-[10.5px] sm:text-[12px] lg:text-[13.5px] font-mono font-bold tracking-[0.24em] uppercase select-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
                        >
                          <textPath
                            href="#heroAvatarRoleArc"
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

                {/* Circular profile container - spacious, never squeezed on mobile */}
                <div
                  id="hero-profile-avatar-slot"
                  className="relative w-44 h-44 sm:w-56 sm:h-56 lg:w-72 lg:h-72 aspect-square flex-shrink-0 rounded-full border-2 border-white/25 hover:border-white/50 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden ring-4 ring-white/10"
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
              </div>

              {/* Handdrawn Freeform Availability Status */}
              <div className="mt-3.5 sm:mt-4 flex items-center justify-center -rotate-2 sm:-rotate-3 hover:rotate-0 transition-transform duration-300 cursor-default select-none">
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
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
