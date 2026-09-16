import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Linkedin, Twitter, Mail, X, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface SocialsInquiryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: SiteSettings;
}

export const SocialsInquiryPopup: React.FC<SocialsInquiryPopupProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const instagramUrl =
    settings?.socialInstagram || 'https://www.instagram.com/zoleptos.motion/';
  const linkedinUrl =
    settings?.socialLinkedin || 'https://www.linkedin.com/in/zolepto-haraya-936b622b7/';
  const xUrl = settings?.socialX || 'https://x.com/Zolep138657';
  const email = settings?.socialGmail || settings?.contactEmail || 'zolepto@gmail.com';
  const mailUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    'Quick Follow-up — Portfolio Inquiry'
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="socials-inquiry-bottom-popup"
          initial={{ y: 50, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[80] w-[95%] max-w-xl"
        >
          <div className="relative bg-zinc-950/95 backdrop-blur-xl text-white border border-zinc-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.65)] rounded-2xl p-4 sm:p-5">
            {/* Top Header Bar: Title with live indicator & dedicated clear Close X button */}
            <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-zinc-100 tracking-tight truncate">
                  You can also connect with me directly:
                </span>
              </div>

              {/* Clear, unmistakable close button on the top right */}
              <button
                id="popup-social-close"
                onClick={onClose}
                aria-label="Close socials popup"
                className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full flex items-center justify-center bg-zinc-800/90 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/70 transition-all cursor-pointer shadow-xs"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Evenly distributed 4-column balanced grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {/* Instagram */}
              <a
                id="popup-social-ig"
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-pink-950/40 border border-zinc-800 hover:border-pink-500/50 text-zinc-200 hover:text-white text-xs font-medium transition-all group shadow-2xs"
                title="Instagram (@zoleptos.motion)"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Instagram className="w-4 h-4 text-zinc-400 group-hover:text-pink-400 shrink-0 transition-colors" />
                  <span className="truncate">Instagram</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-pink-400 shrink-0 transition-colors" />
              </a>

              {/* X / Twitter */}
              <a
                id="popup-social-x"
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white text-xs font-medium transition-all group shadow-2xs"
                title="X (@Zolep138657)"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Twitter className="w-4 h-4 text-zinc-400 group-hover:text-white shrink-0 transition-colors" />
                  <span className="truncate">X</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white shrink-0 transition-colors" />
              </a>

              {/* LinkedIn */}
              <a
                id="popup-social-linkedin"
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-blue-950/40 border border-zinc-800 hover:border-blue-500/50 text-zinc-200 hover:text-white text-xs font-medium transition-all group shadow-2xs"
                title="Connect on LinkedIn"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Linkedin className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 shrink-0 transition-colors" />
                  <span className="truncate">LinkedIn</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 shrink-0 transition-colors" />
              </a>

              {/* Gmail / Direct Mail */}
              <a
                id="popup-social-mail"
                href={mailUrl}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-emerald-950/40 border border-zinc-800 hover:border-emerald-500/50 text-zinc-200 hover:text-white text-xs font-medium transition-all group shadow-2xs"
                title={`Send direct email to ${email}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 shrink-0 transition-colors" />
                  <span className="truncate">Gmail</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 shrink-0 transition-colors" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
