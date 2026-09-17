/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, X, CheckCircle2 } from 'lucide-react';

export const SmartUpdateBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let dismissTimer: NodeJS.Timeout;

    const handleImminent = () => {
      setShowBanner(true);
      setIsDone(false);

      // Transition to updated state after 1.5s
      const doneTimer = setTimeout(() => {
        setIsDone(true);
      }, 1500);

      // Automatically auto-dismiss after 4 seconds total
      dismissTimer = setTimeout(() => {
        setShowBanner(false);
      }, 4000);

      return () => {
        clearTimeout(doneTimer);
        clearTimeout(dismissTimer);
      };
    };

    window.addEventListener('zolepto:auto-refresh-imminent', handleImminent);
    return () => {
      window.removeEventListener('zolepto:auto-refresh-imminent', handleImminent);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleManualReload = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-zinc-950/95 text-white border border-zinc-700/80 shadow-2xl backdrop-blur-md">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-emerald-400">
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
            </span>
            <div className="flex items-center gap-2 pr-1">
              <span className="text-xs font-semibold tracking-tight">
                {isDone ? 'Content Synchronized' : 'Live Update Detected'}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                {isDone ? '• Newest changes are live' : '• Updating in real-time...'}
              </span>
            </div>

            {!isDone && (
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin shrink-0" />
            )}

            <button
              type="button"
              onClick={handleManualReload}
              className="text-[10px] font-mono font-semibold px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Reload page"
            >
              Reload
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
