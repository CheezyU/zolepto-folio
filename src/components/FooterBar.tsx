import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Check, Copy, ExternalLink, Instagram, Linkedin, Twitter } from 'lucide-react';
import { ROTATING_ROLES } from '../data/portfolioData';
import { SiteSettings } from '../types';

interface FooterBarProps {
  onOpenAdmin?: () => void;
  settings?: SiteSettings;
}

export const FooterBar: React.FC<FooterBarProps> = ({ onOpenAdmin, settings }) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const email = settings?.contactEmail || 'zolepto@gmail.com';
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROTATING_ROLES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const instagramUrl = settings?.socialInstagram || 'https://instagram.com/zolepto';
  const linkedinUrl = settings?.socialLinkedin || 'https://linkedin.com/in/zolepto';
  const xUrl = settings?.socialX || 'https://x.com/zolepto';

  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    email
  )}&su=${encodeURIComponent('Project Inquiry — Zolepto')}&body=${encodeURIComponent(
    'Hi Zolepto,\n\nI came across your director reel and would love to collaborate on...'
  )}`;

  return (
    <footer
      id="site-footer"
      className="bg-white border-t border-zinc-200 py-10 px-4 sm:px-6 lg:px-8 relative z-10"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        {/* Left: copyright 2026, Zolepto, and rotating role */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left text-zinc-500">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-zinc-400 font-medium">© 2026</span>
            <span
              id="footer-brand-label"
              className="font-display font-semibold tracking-normal text-zinc-900 text-base select-none"
            >
              Zolepto
            </span>
          </div>

          <span className="text-zinc-300 hidden sm:inline">•</span>

          {/* Floating dynamic rotating role */}
          <div className="h-6 overflow-hidden relative min-w-[200px] flex items-center justify-center sm:justify-start">
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIndex}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -7 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="text-xs sm:text-sm font-normal text-zinc-500 whitespace-nowrap capitalize"
              >
                {ROTATING_ROLES[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Center/Right: Social Buttons for IG, LinkedIn, X, and Gmail */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {/* Instagram */}
          <a
            id="footer-social-ig"
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors text-xs font-semibold"
            title="Follow on Instagram"
          >
            <Instagram className="w-3.5 h-3.5 text-zinc-500 hover:text-pink-600 transition-colors" />
            <span>IG</span>
          </a>

          {/* LinkedIn */}
          <a
            id="footer-social-linkedin"
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors text-xs font-semibold"
            title="Connect on LinkedIn"
          >
            <Linkedin className="w-3.5 h-3.5 text-zinc-500 hover:text-blue-600 transition-colors" />
            <span>LinkedIn</span>
          </a>

          {/* X (formerly Twitter) */}
          <a
            id="footer-social-x"
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors text-xs font-semibold"
            title="Follow on X"
          >
            <Twitter className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-950 transition-colors" />
            <span>X</span>
          </a>

          {/* Direct Gmail */}
          <a
            id="footer-social-gmail"
            href={gmailWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors text-xs font-semibold"
            title="Compose message via Gmail"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-500 hover:text-red-500 transition-colors" />
            <span>Gmail</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
          </a>

          {/* Copy email button */}
          <button
            id="copy-footer-email-btn"
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors text-xs font-mono cursor-pointer"
            title={`Copy ${email} to clipboard`}
          >
            {copiedEmail ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span>{copiedEmail ? 'Copied' : email}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
