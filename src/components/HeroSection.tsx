import React, { useEffect, useState } from 'react';
import { Play, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteSettings } from '../types';

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
  const line1 = settings?.heroTitleLine1 || 'Your visual storyteller';
  const line2 = settings?.heroTitleLine2 || '& content creation director.';
  const subtitle =
    settings?.heroSubtitle ||
    'I craft high-retention commercial cuts, cinematic narratives, and digital formats where every single frame earns its place. Direct 1-on-1 collaboration that makes your work impossible to ignore.';
  const availability = settings?.availabilityStatus || 'Available for incoming projects!';
  const showDot = settings?.showAvailabilityDot ?? true;
  const profilePic = settings?.profilePictureUrl;
  const [imgError, setImgError] = useState(false);

  // Reset img error if profilePic url changes
  useEffect(() => {
    setImgError(false);
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Main Grid: Order optimized so avatar face is seen immediately in mobile view */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-center">
          
          {/* Creator Profile Avatar - Appears FIRST on mobile to immediately show face and establish identity */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="order-first lg:order-last lg:col-span-5 flex flex-col items-center justify-center lg:justify-end mb-4 lg:mb-0"
          >
            <div className="relative group flex flex-col items-center">
              {/* Circular profile container - enlarged on mobile for prominent face representation */}
              <div
                id="hero-profile-avatar-slot"
                className="relative w-36 h-36 sm:w-52 sm:h-52 lg:w-72 lg:h-72 rounded-full border-2 border-white/25 hover:border-white/50 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden ring-4 ring-white/10"
              >
                {/* Custom uploaded/embedded profile picture or fallback silhouette */}
                {profilePic && !imgError ? (
                  <img
                    src={profilePic}
                    alt="Zolepto Hiraya — Director"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <svg
                    className="w-full h-full text-zinc-400/50 hover:text-zinc-300/70 transition-colors transform translate-y-3 sm:translate-y-4"
                    viewBox="0 0 200 200"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Profile photo placeholder"
                  >
                    {/* Head */}
                    <circle cx="100" cy="74" r="34" />
                    {/* Neck */}
                    <path d="M92 104H108V120H92z" />
                    {/* Shoulders / Torso half-body */}
                    <path d="M40 186 C40 142, 68 126, 100 126 C132 126, 160 142, 160 186 C160 192, 156 196, 150 196 H50 C44 196, 40 192, 40 186 Z" />
                  </svg>
                )}

                {/* Active status dot on avatar */}
                <div
                  className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-xs"
                  title="Online / Direct Direction"
                />
              </div>

              {/* Handdrawn Freeform Lopsided Availability Status (Floating naturally near profile picture, NO uniform pill) */}
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

                  {/* Subtle hand-drawn sketchy arrow pointing toward profile */}
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
          </motion.div>

          {/* Left Column: Bold Display Typography, Narrative, CTAs & Metrics */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12]">
                {line1} <br />
                <span className="text-zinc-400 font-semibold">{line2}</span>
              </h1>
            </motion.div>

            {/* Breathable narrative description */}
            <motion.p
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-base md:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 font-body leading-relaxed font-normal"
            >
              {subtitle}
            </motion.p>

            {/* Primary Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
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

            {/* Non-Stacking Horizontal Credibility Metrics on Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
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

        </div>
      </div>
    </section>
  );
};
