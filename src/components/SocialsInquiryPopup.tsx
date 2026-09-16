import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Linkedin, Twitter, Mail, X, MessageSquare, ArrowUpRight } from 'lucide-react';
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
  const instagramUrl = settings?.socialInstagram || 'https://instagram.com/zolepto';
  const linkedinUrl = settings?.socialLinkedin || 'https://linkedin.com/in/zolepto';
  const xUrl = settings?.socialX || 'https://x.com/zolepto';
  const email = settings?.socialGmail || settings?.contactEmail || 'cheddarc19@gmail.com';
  const mailUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    'Quick Follow-up — Portfolio Inquiry'
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="socials-inquiry-bottom-popup"
          initial={{ y: 70, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-xl"
        >
          <div className="bg-zinc-950/95 backdrop-blur-md text-white border border-zinc-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.45)] rounded-2xl p-3.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Friendly short message */}
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-zinc-200 tracking-wide">
                Talk to me here, just in case:
              </span>
            </div>

            {/* Center/Right: Social Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Instagram */}
              <a
                id="popup-social-ig"
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-pink-950/60 border border-zinc-800 hover:border-pink-500/40 text-zinc-300 hover:text-pink-200 text-xs font-semibold transition-all group"
                title="Message on Instagram"
              >
                <Instagram className="w-3.5 h-3.5 text-zinc-400 group-hover:text-pink-400 transition-colors" />
                <span>IG</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-pink-400 transition-colors" />
              </a>

              {/* LinkedIn */}
              <a
                id="popup-social-linkedin"
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-blue-950/60 border border-zinc-800 hover:border-blue-500/40 text-zinc-300 hover:text-blue-200 text-xs font-semibold transition-all group"
                title="Connect on LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              </a>

              {/* X / Twitter */}
              <a
                id="popup-social-x"
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-semibold transition-all group"
                title="Message on X"
              >
                <Twitter className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                <span>X</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
              </a>

              {/* Direct Mail */}
              <a
                id="popup-social-mail"
                href={mailUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-emerald-950/60 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-200 text-xs font-semibold transition-all group"
                title="Send Direct Email"
              >
                <Mail className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                <span>Email</span>
              </a>

              {/* Close Button */}
              <button
                id="popup-social-close"
                onClick={onClose}
                aria-label="Close"
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
