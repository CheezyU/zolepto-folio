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

  // Real-time timecode ticker for director authenticity
  const [timecode, setTimecode] = useState('00:04:18:12');

  useEffect(() => {
    let frame = 12;
    let sec = 18;
    const interval = setInterval(() => {
      frame += 1;
      if (frame >= 24) {
        frame = 0;
        sec += 1;
      }
      const fStr = frame.toString().padStart(2, '0');
      const sStr = (sec % 60).toString().padStart(2, '0');
      setTimecode(`00:04:${sStr}:${fStr}`);
    }, 1000 / 24);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative pt-32 sm:pt-40 pb-28 sm:pb-36 overflow-hidden bg-[#0d0e13] text-zinc-100"
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
        
        {/* Top Director's Status Bar with Customizable Pill */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-between gap-3 mb-8 sm:mb-12"
        >
          {/* Availability Status Pill - Customizable in Admin */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
            {showDot && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
            )}
            <span className="text-xs font-medium text-zinc-200 tracking-tight">
              {availability}
            </span>
          </div>

          {/* Real-time Studio Timecode Monitor */}
          <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-zinc-400 bg-white/5 backdrop-blur-md px-3.5 py-1 rounded-md border border-white/10">
            <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              LIVE TIMELINE
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-white font-medium">{timecode}</span>
            <span className="text-zinc-600">|</span>
            <span>PRORES 422HQ</span>
          </div>
        </motion.div>

        {/* Main Grid: Left Headline & Story / Right Personal Identity Showcase ("Where we show our self") */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Bold Display Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08]">
                {line1} <br />
                <span className="text-zinc-400 font-semibold">{line2}</span>
              </h1>
            </motion.div>

            {/* Breathable narrative description */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-zinc-300 max-w-xl font-body leading-relaxed font-normal"
            >
              {subtitle}
            </motion.p>

            {/* Primary Actions with Hand-Drawn Annotation */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2 flex flex-wrap items-center gap-4 relative"
            >
              <button
                id="hero-play-reel-btn"
                onClick={onPlayFeatured}
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-white text-zinc-950 font-semibold text-xs sm:text-sm tracking-wide hover:bg-zinc-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-zinc-950 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>Watch 2026 Showreel</span>
              </button>

              <button
                id="hero-start-cta"
                onClick={() => onNavigate('start')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm tracking-wide font-semibold transition-all duration-200 hover:border-white/30 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </button>

              {/* Hand-drawn scribble annotation */}
              <div className="hidden xl:flex items-center gap-1.5 pl-2 text-zinc-400">
                <svg
                  className="w-4 h-4 text-zinc-500 rotate-[-15deg]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="font-handwriting text-lg text-zinc-400 font-medium">
                  headphones recommended 🎧
                </span>
              </div>
            </motion.div>

            {/* Minimalist Trust & Credibility Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs font-mono text-zinc-400"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white font-display text-sm">140M+</span>
                <span>Organic Views</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white font-display text-sm">4+ Years</span>
                <span>Timeline Craft</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white font-display text-sm">1-on-1</span>
                <span>Direct Direction</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Clean circular profile placeholder for future professional photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex items-center justify-center lg:justify-end"
          >
            <div className="relative group flex flex-col items-center">
              {/* Circular mock profile container - ready for future <img> */}
              <div
                id="hero-profile-avatar-slot"
                className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full border border-white/20 hover:border-white/40 transition-colors flex items-center justify-center overflow-hidden"
              >
                {/* Mock torso half-body headshot silhouette */}
                <svg
                  className="w-full h-full text-zinc-500/40 hover:text-zinc-500/60 transition-colors transform translate-y-3"
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
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
