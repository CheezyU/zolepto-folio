import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface FolderSectionProps {
  id?: string;
  zIndex: number;
  folderLabel?: string;
  folderNumber?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  cardBg?: string;
  noOverlap?: boolean;
}

/**
 * FolderSection: Tactile 3D stacking paper card layer.
 * Slides smoothly over the preceding section with prominent rounded corners,
 * high-elevation drop shadow, minimal folder index tab, and 100% solid opaque background.
 * Optimized with GPU acceleration for silky-smooth 60/120 FPS scrolling.
 */
export const FolderSection: React.FC<FolderSectionProps> = ({
  id,
  zIndex,
  folderLabel,
  folderNumber,
  headerRight,
  children,
  className = '',
  cardBg = 'bg-[#fafafa]',
  noOverlap = false,
}) => {
  return (
    <div
      id={id}
      className={`relative ${noOverlap ? 'mt-0' : '-mt-10 sm:-mt-16'} transform-gpu will-change-transform ${className}`}
      style={{ zIndex }}
    >
      <div className={`rounded-t-[32px] sm:rounded-t-[44px] ${cardBg} border-t border-zinc-200/90 shadow-[0_-18px_40px_-10px_rgba(0,0,0,0.22),0_-6px_16px_-6px_rgba(0,0,0,0.1),0_-1px_0_0_rgba(255,255,255,0.95)_inset] relative`}>
        {/* Tactile 3D Folder Index Tab & Grip Handle (Clean, no side watermark clutter) */}
        <div className={`relative z-50 pt-3 pb-2.5 px-6 sm:px-10 flex items-center justify-between pointer-events-none select-none border-b border-zinc-200/60 ${cardBg} rounded-t-[32px] sm:rounded-t-[44px]`}>
          {/* Left Folder Index: Simple "01 > Portfolio" format */}
          <div className="flex items-center gap-2">
            {folderNumber && (
              <span className="px-2 py-0.5 rounded bg-zinc-950 text-white font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider">
                {folderNumber}
              </span>
            )}
            {folderNumber && folderLabel && (
              <span className="font-mono text-zinc-400 text-xs font-semibold">&gt;</span>
            )}
            {folderLabel && (
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-700 font-semibold">
                {folderLabel}
              </span>
            )}
          </div>

          {/* Center Tactile Grip Bar */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3">
            <span className="block w-12 sm:w-16 h-1 sm:h-1.5 rounded-full bg-zinc-300 shadow-inner" />
          </div>

          {/* Upper Right Round Corner Slot */}
          <div className="flex items-center justify-end min-w-8 pointer-events-auto relative z-50">
            {headerRight || <div className="w-10" />}
          </div>
        </div>

        {/* 100% Solid Opaque Section Content (Prevents any ghosting or bleed-through) */}
        <div className={`relative z-0 ${cardBg}`}>{children}</div>
      </div>
    </div>
  );
};

/**
 * HeroStickyFolder: Clean wrapper for the hero section that allows natural
 * viewport flow so hero content, headline, and credibility metrics are never
 * crushed, collapsed, or covered under.
 */
export const HeroStickyFolder: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative z-10 w-full bg-[#0d0e13]">
      {children}
    </div>
  );
};

