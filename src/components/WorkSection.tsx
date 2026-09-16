import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  ExternalLink,
  X,
  Sparkles,
  Layers,
  Volume2,
  Film,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MAIN_SHOWREEL } from '../data/portfolioData';
import { VideoProject, GraphicProject } from '../types';

interface WorkSectionProps {
  showreels: VideoProject[];
  graphics: GraphicProject[];
  activeTab?: 'all' | 'showreels' | 'design';
  onTabChange?: (tab: 'all' | 'showreels' | 'design') => void;
  onOpenVideoModal: (project: VideoProject) => void;
}

type MainTab = 'all' | 'showreels' | 'design';

export const WorkSection: React.FC<WorkSectionProps> = ({
  showreels,
  graphics,
  activeTab = 'all',
  onTabChange,
  onOpenVideoModal,
}) => {
  const [currentTab, setCurrentTab] = useState<MainTab>(activeTab);
  const [isPlayingMaster, setIsPlayingMaster] = useState(false);
  const [selectedGraphic, setSelectedGraphic] = useState<GraphicProject | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Synchronize internal tab state when activeTab prop changes
  useEffect(() => {
    if (activeTab && activeTab !== currentTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  // Lock body scroll during graphic lightbox
  useEffect(() => {
    if (!selectedGraphic) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedGraphic(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedGraphic]);

  // Handle switching tabs while strictly keeping work section comfortably in viewport
  const handleTabClick = (tab: MainTab) => {
    setCurrentTab(tab);
    if (onTabChange) onTabChange(tab);

    if (sectionRef.current) {
      const headerOffset = 80;
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.top < 40 || rect.top > 260) {
        const targetY = rect.top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }
  };

  // Build unified items list for display
  type UnifiedItem =
    | { type: 'video'; data: VideoProject }
    | { type: 'graphic'; data: GraphicProject };

  let unifiedItems: UnifiedItem[] = [];
  if (currentTab === 'all') {
    const maxLen = Math.max(showreels.length, graphics.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < showreels.length) {
        unifiedItems.push({ type: 'video', data: showreels[i] });
      }
      if (i < graphics.length) {
        unifiedItems.push({ type: 'graphic', data: graphics[i] });
      }
    }
  } else if (currentTab === 'showreels') {
    unifiedItems = showreels.map((v) => ({ type: 'video', data: v }));
  } else {
    unifiedItems = graphics.map((g) => ({ type: 'graphic', data: g }));
  }

  const fallbackThumbnail =
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80';

  return (
    <section
      ref={sectionRef}
      id="work-section"
      className="py-20 sm:py-28 relative rounded-t-[36px] sm:rounded-t-[48px] -mt-10 sm:-mt-16 z-20 border-t border-zinc-200/90 bg-[#fafafa] shadow-[0_-24px_50px_rgba(0,0,0,0.12)]"
    >
      {/* Anchor targets */}
      <div id="showreels" className="absolute -top-24 pointer-events-none" />
      <div id="graphic-design" className="absolute -top-24 pointer-events-none" />
      <div id="work" className="absolute -top-24 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Apple-style Minimalist Segmented Control with motion indicator */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-6"
        >
          <div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
              What I Build
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base max-w-xl mt-2 font-normal leading-relaxed">
              See what your story could look and feel like when brought to life. Every project here was crafted hand-in-hand with creators—and yours can be next.
            </p>
          </div>

          {/* Segmented Apple-style Switcher with smooth background slide */}
          <div className="relative inline-flex items-center p-1 rounded-full bg-zinc-200/70 border border-zinc-300/60 shadow-2xs self-start sm:self-auto">
            <button
              id="work-tab-all"
              onClick={() => handleTabClick('all')}
              className={`relative px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition-colors duration-200 cursor-pointer z-10 ${
                currentTab === 'all' ? 'text-white' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {currentTab === 'all' && (
                <motion.div
                  layoutId="activeWorkTabPill"
                  className="absolute inset-0 rounded-full bg-zinc-950 shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              All Work
            </button>

            <button
              id="work-tab-showreels"
              onClick={() => handleTabClick('showreels')}
              className={`relative px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition-colors duration-200 cursor-pointer z-10 ${
                currentTab === 'showreels' ? 'text-white' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {currentTab === 'showreels' && (
                <motion.div
                  layoutId="activeWorkTabPill"
                  className="absolute inset-0 rounded-full bg-zinc-950 shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              Showreels
            </button>

            <button
              id="work-tab-design"
              onClick={() => handleTabClick('design')}
              className={`relative px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition-colors duration-200 cursor-pointer z-10 ${
                currentTab === 'design' ? 'text-white' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {currentTab === 'design' && (
                <motion.div
                  layoutId="activeWorkTabPill"
                  className="absolute inset-0 rounded-full bg-zinc-950 shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              Graphic Design
            </button>
          </div>
        </motion.div>

        {/* Master Cinema Showreel Player (Showcased when viewing Showreels) */}
        {currentTab === 'showreels' && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6 }}
            className="mb-12 sm:mb-16"
          >
            <div className="relative rounded-3xl bg-zinc-950 overflow-hidden shadow-xl border border-zinc-800">
              <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                {isPlayingMaster ? (
                  <iframe
                    src={`${MAIN_SHOWREEL.embedUrl}&autoplay=1`}
                    title={MAIN_SHOWREEL.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div
                    className="relative w-full h-full group cursor-pointer"
                    onClick={() => setIsPlayingMaster(true)}
                  >
                    <img
                      src={MAIN_SHOWREEL.thumbnailUrl}
                      alt={MAIN_SHOWREEL.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

                    {/* Apple TV style Play Orb */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-zinc-950 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
                        <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-1 text-zinc-950" />
                      </div>
                    </div>

                    <div className="absolute bottom-5 sm:bottom-7 left-5 sm:left-8 right-5 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white pointer-events-none">
                      <div>
                        <div className="inline-flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                            Master Showreel • {MAIN_SHOWREEL.duration}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                            4K PRORES
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                          {MAIN_SHOWREEL.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">
                        {MAIN_SHOWREEL.metrics || '4K Cinematic Cut'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Showcase Cards Container */}
        <div className="relative">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            ref={sliderRef}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0"
          >
            {unifiedItems.map((item) => {
              if (item.type === 'video') {
                const video = item.data;
                return (
                  <div
                    key={`vid-${video.id}`}
                    id={`video-card-${video.id}`}
                    onClick={() => onOpenVideoModal(video)}
                    className="group shrink-0 w-[85vw] sm:w-[360px] md:w-auto snap-start flex flex-col rounded-2xl bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative overflow-hidden bg-zinc-100 aspect-video w-full">
                      <img
                        src={video.thumbnailUrl || fallbackThumbnail}
                        alt={video.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackThumbnail;
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />

                      {/* Runtime Badge */}
                      {video.duration && (
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[11px] font-mono text-white font-medium">
                          {video.duration}
                        </span>
                      )}

                      {/* Category Tag */}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-zinc-900 shadow-2xs">
                        {video.categoryLabel || video.category}
                      </span>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-12 h-12 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5 text-zinc-950" />
                        </div>
                      </div>
                    </div>

                    {/* Card Meta with Timeline Craft Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                          <span>{video.client}</span>
                          <span>{video.year || '2026'}</span>
                        </div>
                        <h4 className="font-display font-semibold text-base sm:text-lg text-zinc-950 group-hover:text-zinc-700 transition-colors line-clamp-1">
                          {video.title}
                        </h4>
                        {video.description && (
                          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                            {video.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-zinc-500 flex items-center gap-1">
                          <Film className="w-3 h-3 text-zinc-400" />
                          {video.role || 'Lead Editor'}
                        </span>
                        <span className="font-medium text-zinc-900 group-hover:underline">
                          Watch Project →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const graphic = item.data;
                return (
                  <div
                    key={`graph-${graphic.id}`}
                    id={`graphic-card-${graphic.id}`}
                    onClick={() => setSelectedGraphic(graphic)}
                    className="group shrink-0 w-[85vw] sm:w-[360px] md:w-auto snap-start flex flex-col rounded-2xl bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    {/* Graphic Preview */}
                    <div className="relative overflow-hidden bg-zinc-100 aspect-video w-full">
                      <img
                        src={graphic.imageUrl}
                        alt={graphic.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />

                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-semibold text-zinc-900 shadow-2xs">
                        {graphic.categoryLabel || graphic.category}
                      </span>

                      {/* Aspect Ratio Badge */}
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-mono text-zinc-300 uppercase">
                        {graphic.aspect || 'Graphic'}
                      </span>
                    </div>

                    {/* Card Meta */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                          <span>{graphic.client}</span>
                          <span>{graphic.year}</span>
                        </div>
                        <h4 className="font-display font-semibold text-base sm:text-lg text-zinc-950 group-hover:text-zinc-700 transition-colors line-clamp-1">
                          {graphic.title}
                        </h4>
                        {graphic.description && (
                          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                            {graphic.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-zinc-500 truncate max-w-[180px]">
                          {graphic.tools.join(' • ')}
                        </span>
                        <span className="font-medium text-zinc-900 group-hover:underline">
                          View Still →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </motion.div>

          {/* Mobile slide indicator */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-4 text-[11px] font-mono text-zinc-400">
            <span>← Swipe horizontally to explore archive →</span>
          </div>
        </div>
      </div>

      {/* Graphic Design Lightbox Modal */}
      {selectedGraphic && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8 transition-opacity"
          onClick={() => setSelectedGraphic(null)}
        >
          <button
            onClick={() => setSelectedGraphic(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            aria-label="Close image"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[320px] max-h-[65vh]">
              <img
                src={selectedGraphic.imageUrl}
                alt={selectedGraphic.title}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-6 sm:p-7 bg-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
                  <span>{selectedGraphic.client}</span>
                  <span>•</span>
                  <span>{selectedGraphic.categoryLabel || selectedGraphic.category}</span>
                  <span>•</span>
                  <span>{selectedGraphic.year}</span>
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                  {selectedGraphic.title}
                </h3>
                {selectedGraphic.description && (
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl font-normal">
                    {selectedGraphic.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedGraphic.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Full Resolution</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
