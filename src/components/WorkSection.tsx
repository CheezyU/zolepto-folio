import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';
import { MAIN_SHOWREEL } from '../data/portfolioData';
import { VideoProject, GraphicProject } from '../types';
import { GraphicModal } from './GraphicModal';

interface WorkSectionProps {
  showreels: VideoProject[];
  graphics: GraphicProject[];
  activeTab?: 'all' | 'showreels' | 'design';
  onTabChange?: (tab: 'all' | 'showreels' | 'design') => void;
  onOpenVideoModal: (project: VideoProject) => void;
  onNavigateToCreate?: () => void;
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
  const fallbackGraphic =
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

  return (
    <section
      ref={sectionRef}
      id="work-section"
      className="py-16 sm:py-24 relative bg-[#fafafa]"
    >
      {/* Anchor targets */}
      <div id="showreels" className="absolute -top-24 pointer-events-none" />
      <div id="graphic-design" className="absolute -top-24 pointer-events-none" />
      <div id="work" className="absolute -top-24 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Minimalist Section Header maintaining proportional vertical space */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 relative"
        >
          {/* Centered Title - Clean, left alone, perfectly centered */}
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
            What I Build
          </h2>

          {/* Centered Subtitle */}
          <p className="text-zinc-600 text-sm sm:text-base max-w-xl mx-auto mt-3 font-normal leading-relaxed">
            See what your story could look and feel like when brought to life. Every project here was crafted hand-in-hand with creators—and yours can be next.
          </p>

          {/* Centered Category Buttons Underneath with Apple-style Segmented Slide */}
          <div className="mt-8 flex justify-center">
            <div className="relative inline-flex items-center p-1 rounded-full bg-zinc-200/70 border border-zinc-300/60 shadow-2xs">
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
          </div>
        </motion.div>

        {/* Master Cinema Showreel Player (Showcased when viewing Showreels) - Streamlined, no duration */}
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
                            Master Showreel
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

        {/* Minimalist Showcase Cards Container: Thumbnails Stand Out Fully, Exactly 3 Elements (Title, Creator/Client, Category) */}
        <div className="relative">
          {/* Subtle edge fade-off overlays on left and right sides of viewport for mobile/tablet displays */}
          <div
            className="md:hidden pointer-events-none absolute top-0 bottom-4 -left-4 sm:-left-6 w-7 sm:w-10 bg-gradient-to-r from-[#fafafa] via-[#fafafa]/80 to-transparent z-10"
            aria-hidden="true"
          />
          <div
            className="md:hidden pointer-events-none absolute top-0 bottom-4 -right-4 sm:-right-6 w-7 sm:w-10 bg-gradient-to-l from-[#fafafa] via-[#fafafa]/80 to-transparent z-10"
            aria-hidden="true"
          />

          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            ref={sliderRef}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0 scrollbar-none -mx-4 sm:-mx-6 md:mx-0 px-4 sm:px-6 md:px-0 scroll-pl-4 sm:scroll-pl-6"
          >
            {unifiedItems.map((item) => {
              if (item.type === 'video') {
                const video = item.data;
                return (
                  <div
                    key={`vid-${video.id}`}
                    id={`video-card-${video.id}`}
                    onClick={() => onOpenVideoModal(video)}
                    className="group shrink-0 w-[84vw] sm:w-[360px] md:w-auto snap-start flex flex-col rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    {/* Clean Cinematic 16:9 Thumbnail with Frosted Category Pill in Upper Right Corner */}
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
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/25 transition-colors duration-300" />

                      {/* Frosted Category Pill in Upper Right Corner */}
                      <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white/95 text-[10px] font-mono font-medium tracking-wide border border-white/20 shadow-xs">
                          {video.categoryLabel || video.category}
                        </span>
                      </div>

                      {/* Minimalist Centered Play Orb on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="w-12 h-12 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5 text-zinc-950" />
                        </div>
                      </div>
                    </div>

                    {/* Side by Side: Title on the Left, Creator / Client on the Right (Balanced Scale & No Squashing) */}
                    <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2.5 min-w-0">
                      <h4
                        title={video.title}
                        className="font-display font-semibold text-xs sm:text-[13px] text-zinc-900 group-hover:text-zinc-600 transition-colors truncate min-w-0 flex-1 leading-snug"
                      >
                        {video.title}
                      </h4>
                      <span
                        title={video.client}
                        className="text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase tracking-wider shrink-0 max-w-[38%] truncate text-right font-medium"
                      >
                        {video.client}
                      </span>
                    </div>
                  </div>
                );
              } else {
                const graphic = item.data;
                const graphicSrc =
                  (graphic.imageUrl && graphic.imageUrl.trim()) || fallbackGraphic;

                return (
                  <div
                    key={`graph-${graphic.id}`}
                    id={`graphic-card-${graphic.id}`}
                    onClick={() => setSelectedGraphic(graphic)}
                    className="group shrink-0 w-[84vw] sm:w-[360px] md:w-auto snap-start flex flex-col rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    {/* Clean Graphic Thumbnail with Frosted Category Pill in Upper Right Corner */}
                    <div className="relative overflow-hidden bg-zinc-100 aspect-video w-full">
                      <img
                        src={graphicSrc}
                        alt={graphic.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackGraphic;
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300" />

                      {/* Frosted Category Pill in Upper Right Corner */}
                      <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white/95 text-[10px] font-mono font-medium tracking-wide border border-white/20 shadow-xs">
                          {graphic.categoryLabel || graphic.category}
                        </span>
                      </div>
                    </div>

                    {/* Side by Side: Title on the Left, Creator / Client on the Right (Balanced Scale & No Squashing) */}
                    <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2.5 min-w-0">
                      <h4
                        title={graphic.title}
                        className="font-display font-semibold text-xs sm:text-[13px] text-zinc-900 group-hover:text-zinc-600 transition-colors truncate min-w-0 flex-1 leading-snug"
                      >
                        {graphic.title}
                      </h4>
                      <span
                        title={graphic.client}
                        className="text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase tracking-wider shrink-0 max-w-[38%] truncate text-right font-medium"
                      >
                        {graphic.client}
                      </span>
                    </div>
                  </div>
                );
              }
            })}
            {/* End spacer for smooth mobile snap padding */}
            <div className="w-4 shrink-0 md:hidden pointer-events-none" aria-hidden="true" />
          </motion.div>
        </div>
      </div>

      {/* Graphic Design Lightbox Modal */}
      <GraphicModal
        graphic={selectedGraphic}
        onClose={() => setSelectedGraphic(null)}
      />
    </section>
  );
};
