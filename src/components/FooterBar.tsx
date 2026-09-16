import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Check, Copy, ExternalLink } from 'lucide-react';
import { ROTATING_ROLES } from '../data/portfolioData';

interface FooterBarProps {
  onOpenAdmin?: () => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({ onOpenAdmin }) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const email = 'zolepto@gmail.com';
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Press-and-hold backdoor state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startHold = (e: React.PointerEvent | React.TouchEvent) => {
    if ('button' in e && e.button !== 0) return;
    setIsHolding(true);
    setHoldProgress(0);
    const holdDuration = 1500;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / holdDuration) * 100);
      setHoldProgress(pct);
      if (pct < 100) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);

    timerRef.current = window.setTimeout(() => {
      setIsHolding(false);
      setHoldProgress(0);
      if (navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore
        }
      }
      onOpenAdmin?.();
    }, holdDuration);
  };

  const cancelHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent('Project Inquiry — Zolepto')}`;

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROTATING_ROLES.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <footer
      id="footer"
      className="border-t border-zinc-200 bg-white py-12 sm:py-16 px-4 sm:px-8 mt-auto"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        {/* Left: copyright 2026, Zolepto (with press-and-hold backdoor), and floating rotating role */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left text-zinc-500">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-zinc-400 font-medium">© 2026</span>
            
            {/* Secret Backdoor Trigger: Hidden in Plain Sight on "Zolepto" text */}
            <span
              id="footer-backdoor-trigger"
              onPointerDown={startHold}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              onPointerCancel={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              onTouchCancel={cancelHold}
              onContextMenu={(e) => {
                if (isHolding) e.preventDefault();
              }}
              className="relative inline-block font-display font-semibold tracking-normal text-zinc-900 text-base cursor-default select-none transition-colors"
              title="Zolepto"
            >
              Zolepto
              {/* Subtle fill line visible only when pressed & held */}
              {isHolding && (
                <span
                  className="absolute left-0 bottom-0 h-0.5 bg-zinc-900 rounded-full transition-all duration-75 pointer-events-none"
                  style={{ width: `${holdProgress}%` }}
                />
              )}
            </span>
          </div>

          <span className="text-zinc-300 hidden sm:inline">•</span>

          {/* Floating dynamic rotating role with ample room */}
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

        {/* Right side: direct email actions (Mailto + Direct Gmail web composer + Copy button) */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <a
            id="direct-click-email"
            href={`mailto:${email}?subject=Project%20Inquiry%20—%20Zolepto`}
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 hover:text-zinc-950 transition-all text-xs sm:text-sm font-mono cursor-pointer"
            title="Open default email app"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
            <span className="group-hover:underline underline-offset-4 font-medium">
              {email}
            </span>
          </a>

          <a
            id="direct-gmail-web-btn"
            href={gmailWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 transition-all text-xs font-mono cursor-pointer"
            title="Open in Gmail web composer directly"
          >
            <span>Gmail</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </a>

          <button
            id="copy-footer-email-btn"
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 transition-all text-xs font-mono cursor-pointer"
            title="Copy email to clipboard"
          >
            {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
