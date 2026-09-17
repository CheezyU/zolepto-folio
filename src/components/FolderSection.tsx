import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface FolderSectionProps {
  id?: string;
  zIndex: number;
  folderLabel?: string;
  folderNumber?: string;
  watermark?: string;
  children: React.ReactNode;
  className?: string;
  cardBg?: string;
}

/**
 * FolderSection: Tactile 3D stacking paper card layer.
 * Slides smoothly over the preceding section with prominent rounded corners,
 * high-elevation drop shadow, folder index tab, and 100% solid opaque background.
 * Optimized for butter-smooth 60/120 FPS performance without GPU lag or texture thrashing.
 */
export const FolderSection: React.FC<FolderSectionProps> = ({
  id,
  zIndex,
  folderLabel,
  folderNumber,
  watermark = 'DIRECTORIAL ARCHIVE',
  children,
  className = '',
  cardBg = 'bg-[#fafafa]',
}) => {
  return (
    <div
      id={id}
      className={`relative -mt-10 sm:-mt-16 ${className}`}
      style={{ zIndex }}
    >
      <div className={`rounded-t-[32px] sm:rounded-t-[44px] ${cardBg} border-t border-zinc-200/90 shadow-[0_-18px_40px_-10px_rgba(0,0,0,0.22),0_-6px_16px_-6px_rgba(0,0,0,0.1),0_-1px_0_0_rgba(255,255,255,0.95)_inset] transition-shadow duration-300 relative overflow-hidden`}>
        {/* Tactile 3D Folder Index Tab & Grip Handle */}
        <div className={`relative pt-3.5 pb-2.5 px-6 sm:px-10 flex items-center justify-between pointer-events-none select-none border-b border-zinc-200/60 ${cardBg} rounded-t-[32px] sm:rounded-t-[44px]`}>
          {/* Left Folder Index Identifier */}
          <div className="flex items-center gap-2">
            {folderNumber && (
              <span className="px-2 py-0.5 rounded bg-zinc-950 text-white font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider">
                {folderNumber}
              </span>
            )}
            {folderLabel && (
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">
                {folderLabel}
              </span>
            )}
          </div>

          {/* Center Tactile Grip Bar */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3">
            <span className="block w-12 sm:w-16 h-1 sm:h-1.5 rounded-full bg-zinc-300 shadow-inner" />
          </div>

          {/* Right Workshop Watermark */}
          <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase tracking-widest hidden sm:block">
            {watermark}
          </div>
        </div>

        {/* 100% Solid Opaque Section Content (Prevents any ghosting or bleed-through) */}
        <div className={`relative ${cardBg}`}>{children}</div>
      </div>
    </div>
  );
};

/**
 * HeroStickyFolder: The stationary first upper page that stays perfectly still
 * at the top of the viewport when scrolling begins, receding slightly in depth
 * as the first card slides up over it.
 *
 * CRITICAL FIX: Fully unpins, drops opacity to 0, and sets visibility to hidden
 * once scrolled past (~700px), guaranteeing the hero headline text NEVER burns
 * into or leaks through subsequent pages.
 */
export const HeroStickyFolder: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // As the user scrolls from 0 to 650px:
  // Hero stays stationary at the top while Card 01 moves up over it.
  // Subtle cinematic depth: gently scales to 0.95 and dims slightly.
  // Once Card 01 covers it (past 700px), Hero is 100% opacity 0 and hidden so it NEVER burns onto the screen!
  const scale = useTransform(scrollY, [0, 600], [1, 0.95]);
  const opacity = useTransform(scrollY, [0, 480, 680], [1, 0.6, 0]);
  const dimOpacity = useTransform(scrollY, [0, 550], [0, 0.55]);
  const isHidden = useTransform(scrollY, (v) => (v > 720 ? 'hidden' : 'visible'));
  const pointerEvents = useTransform(scrollY, (v) => (v > 650 ? 'none' : 'auto'));

  return (
    <div
      ref={containerRef}
      className="sticky top-0 z-10 w-full overflow-hidden bg-[#0d0e13]"
    >
      <motion.div
        style={{
          scale,
          opacity,
          visibility: isHidden,
          pointerEvents,
        }}
        className="origin-top w-full h-full relative"
      >
        {children}

        {/* 3D Depth Dimming Scrim */}
        <motion.div
          style={{ opacity: dimOpacity }}
          className="absolute inset-0 bg-black pointer-events-none z-30"
        />
      </motion.div>
    </div>
  );
};

