import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomInquiryBadgeProps {
  onNavigateToCreate?: () => void;
}

export const CustomInquiryBadge: React.FC<CustomInquiryBadgeProps> = ({
  onNavigateToCreate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape, outside click, or scroll movement
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Hand-drawn Question Mark Button Badge */}
      <button
        id="what-i-build-question-badge"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative group p-1 text-zinc-400 hover:text-zinc-950 transition-all duration-200 focus:outline-none cursor-pointer hover:scale-105 active:scale-95 rounded-full z-10"
        title="Can't find what you're looking for?"
        aria-label="Can't find what you're looking for?"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7"
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M 50,10 C 74,8 92,26 90,52 C 88,76 72,92 48,91 C 24,90 10,74 11,50 C 12,26 28,11 52,10"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 40,36 C 40,28 47,23 53,23 C 60,23 65,27 65,34 C 65,42 53,46 53,54"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="53" cy="67" r="3.5" fill="currentColor" />
        </svg>
      </button>

      {/* Tooltip popover: Always visible and stacked on top of everything */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-outside dismissal layer */}
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Tooltip Card: Positioned strictly above all text and card content */}
            <motion.div
              id="custom-inquiry-tooltip"
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="absolute right-0 top-full mt-2.5 z-50 w-[calc(100vw-2.5rem)] max-w-[340px] sm:w-84 p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white shadow-2xl border border-zinc-800 text-left pointer-events-auto"
            >
              {/* Arrow pointing to the question mark trigger */}
              <div className="absolute -top-1.5 right-3.5 w-3 h-3 bg-zinc-950 border-t border-l border-zinc-800 rotate-45" />

              <button
                id="close-custom-inquiry-tooltip"
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                aria-label="Close message"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-300 uppercase tracking-wider font-semibold">
                    Looking for something else?
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-body">
                  Can't find what you're looking for? I'm versatile and adaptable—willing to step out of my comfort zone, try new styles, and do test work to see what clicks.
                </p>

                <button
                  id="what-i-build-lets-go-btn"
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (onNavigateToCreate) {
                      onNavigateToCreate();
                    } else {
                      const el = document.getElementById('start');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold tracking-wide transition-all shadow-sm group/btn cursor-pointer"
                >
                  <span>Let's Go</span>
                  <ArrowDownRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:translate-y-0.5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
