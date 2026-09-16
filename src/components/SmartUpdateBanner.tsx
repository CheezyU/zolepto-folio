/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles } from 'lucide-react';

export const SmartUpdateBanner: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleImminent = () => {
      setIsRefreshing(true);
    };

    window.addEventListener('zolepto:auto-refresh-imminent', handleImminent);
    return () => {
      window.removeEventListener('zolepto:auto-refresh-imminent', handleImminent);
    };
  }, []);

  return (
    <AnimatePresence>
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-zinc-900/95 text-white border border-zinc-700/80 shadow-2xl backdrop-blur-md">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div className="flex items-center gap-2 pr-1">
              <span className="text-xs font-medium tracking-tight">
                Live update detected
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                • Synchronizing latest published content...
              </span>
            </div>
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
