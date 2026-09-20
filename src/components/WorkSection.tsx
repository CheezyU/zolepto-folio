import React, { useState, useEffect, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoProject, GraphicProject, WorkSectionTab } from '../types';
import { GraphicModal } from './GraphicModal';
import { isShortFormVideo } from '../lib/videoEmbed';

interface WorkSectionProps {
  showreels: VideoProject[];
  graphics: GraphicProject[];
  activeTab?: WorkSectionTab;
  onTabChange?: (tab: WorkSectionTab) => void;
  onOpenVideoModal: (project: VideoProject) => void;
  onNavigateToCreate?: () => void;
}

type MainTab = WorkSectionTab;

export const WorkSection: React.FC<WorkSectionProps> = ({
  showreels,
  graphics,
  activeTab = 'videos',
  onTabChange,
  onOpenVideoModal,
}) => {
  const [currentTab, setCurrentTab] = useState<MainTab>(activeTab);
  const [selectedGraphic, setSelectedGraphic] = useState<GraphicProject | null>(null);

  // Pagination & drag states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);

  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Synchronize internal tab state when activeTab prop changes
  useEffect(() => {
    if (activeTab && activeTab !== currentTab) {
      setCurrentTab(activeTab);
      setCurrentPage(0);
      setDirection(0);
    }
  }, [activeTab]);

  // Handle switching tabs while strictly keeping work section comfortably in viewport
  const handleTabClick = (tab: MainTab) => {
    setCurrentTab(tab);
    setCurrentPage(0);
    setDirection(0);
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
  if (currentTab === 'videos' || currentTab === 'showreels') {
    // Only traditional/horizontal videos (non-short form)
    unifiedItems = showreels
      .filter((v) => !isShortFormVideo(v))
      .map((v) => ({ type: 'video', data: v }));
  } else if (currentTab === 'shorts') {
    // Only short-form vertical videos (auto-detected or category)
    unifiedItems = showreels
      .filter((v) => isShortFormVideo(v))
      .map((v) => ({ type: 'video', data: v }));
  } else {
    // Graphic Design
    unifiedItems = graphics.map((g) => ({ type: 'graphic', data: g }));
  }

  // Determine items per page: 8 for dedicated vertical shorts (4 columns x 2 rows), 6 for standard (3 columns x 2 rows)
  const itemsPerPage = currentTab === 'shorts' ? 8 : 6;
  const totalPages = Math.max(1, Math.ceil(unifiedItems.length / itemsPerPage));

  // Ensure currentPage is always valid if items count changes
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const startIndex = currentPage * itemsPerPage;
  const visibleItems = unifiedItems.slice(startIndex, startIndex + itemsPerPage);

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage((prev) => prev + 1);
    }
  };

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
      <div id="videos" className="absolute -top-24 pointer-events-none" />
      <div id="showreels" className="absolute -top-24 pointer-events-none" />
      <div id="shorts" className="absolute -top-24 pointer-events-none" />
      <div id="graphic-design" className="absolute -top-24 pointer-events-none" />
      <div id="work" className="absolute -top-24 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Minimalist Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 relative"
        >
          {/* Centered Title */}
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
            What I Build
          </h2>

          {/* Centered Subtitle */}
          <p className="text-zinc-600 text-sm sm:text-base max-w-xl mx-auto mt-3 font-normal leading-relaxed">
            See what your story could look and feel like when brought to life. Every project here was crafted hand-in-hand with creators—and yours can be next.
          </p>

          {/* Category Tabs Pill Bar: Videos | Shorts | Graphic Design */}
          <div className="mt-8 flex justify-center">
            <div className="relative inline-flex flex-wrap sm:flex-nowrap items-center p-1 rounded-full bg-zinc-200/70 border border-zinc-300/60 shadow-2xs gap-0.5">
              <button
                id="work-tab-videos"
                type="button"
                onClick={() => handleTabClick('videos')}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition-colors duration-200 cursor-pointer z-10 ${
                  currentTab === 'videos' || currentTab === 'showreels' ? 'text-white' : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {(currentTab === 'videos' || currentTab === 'showreels') && (
                  <motion.div
                    layoutId="activeWorkTabPill"
                    className="absolute inset-0 rounded-full bg-zinc-950 shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                Videos
              </button>

              <button
                id="work-tab-shorts"
                type="button"
                onClick={() => handleTabClick('shorts')}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition-colors duration-200 cursor-pointer z-10 ${
                  currentTab === 'shorts' ? 'text-white' : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {currentTab === 'shorts' && (
                  <motion.div
                    layoutId="activeWorkTabPill"
                    className="absolute inset-0 rounded-full bg-zinc-950 shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                Shorts
              </button>

              <button
                id="work-tab-design"
                type="button"
                onClick={() => handleTabClick('design')}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition-colors duration-200 cursor-pointer z-10 ${
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

        {/* Responsive Container */}
        <div className="relative">
          {/* Mobile Display: Horizontal snap scroll */}
          <div className="md:hidden relative">
            <div
              className="pointer-events-none absolute top-0 bottom-0 -left-4 sm:-left-6 w-8 sm:w-10 bg-gradient-to-r from-[#fafafa] via-[#fafafa]/80 to-transparent z-10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute top-0 bottom-0 -right-4 sm:-right-6 w-8 sm:w-10 bg-gradient-to-l from-[#fafafa] via-[#fafafa]/80 to-transparent z-10"
              aria-hidden="true"
            />

            <motion.div
              key={`mobile-${currentTab}`}
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none -mx-4 sm:-mx-6 px-4 sm:px-6 scroll-pl-4 sm:scroll-pl-6"
            >
              {unifiedItems.length === 0 ? (
                <div className="w-full text-center py-12 text-zinc-500 text-xs font-mono">
                  No projects available in this category yet.
                </div>
              ) : (
                unifiedItems.map((item) => {
                  if (item.type === 'video') {
                    const video = item.data;
                    const isShort = isShortFormVideo(video);

                    // If viewing dedicated Shorts tab: render vertical card
                    if (currentTab === 'shorts') {
                      return (
                        <div
                          key={`mob-vid-${video.id}`}
                          id={`mob-video-card-${video.id}`}
                          onClick={() => onOpenVideoModal(video)}
                          className="group shrink-0 w-[65vw] sm:w-[240px] aspect-[9/16] snap-start flex flex-col rounded-2xl bg-zinc-950 border border-zinc-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer relative select-none"
                        >
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

                          {/* Top Badges */}
                          <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-end z-10 pointer-events-none">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/15 truncate max-w-[120px]">
                              {video.categoryLabel || 'Shorts'}
                            </span>
                          </div>

                          {/* Center Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-11 h-11 rounded-full bg-white/95 text-zinc-950 flex items-center justify-center shadow-lg">
                              <Play className="w-4 h-4 fill-current ml-0.5 text-zinc-950" />
                            </div>
                          </div>

                          {/* Bottom Details Overlay */}
                          <div className="absolute bottom-0 inset-x-0 p-3.5 pt-12 bg-gradient-to-t from-black/95 via-black/75 to-transparent z-10 pointer-events-none flex flex-col gap-1">
                            <h4
                              title={video.title}
                              className="font-display font-semibold text-xs sm:text-[13px] text-white line-clamp-2 leading-snug"
                            >
                              {video.title}
                            </h4>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <span
                                title={video.client}
                                className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider truncate font-medium"
                              >
                                {video.client}
                              </span>
                              {(video.views || video.duration) && (
                                <span className="text-[10px] font-mono text-emerald-400 font-semibold shrink-0">
                                  {video.views || video.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Otherwise (mixed in All Work or Videos): force vertical into standard landscape size card matching long form
                    if (isShort) {
                      return (
                        <div
                          key={`mob-vid-${video.id}`}
                          id={`mob-video-card-${video.id}`}
                          onClick={() => onOpenVideoModal(video)}
                          className="group shrink-0 w-[84vw] sm:w-[380px] snap-start flex flex-col rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition-all duration-300 overflow-hidden cursor-pointer"
                        >
                          <div className="relative overflow-hidden bg-zinc-950 aspect-video w-full flex items-center justify-center">
                            {/* Ambient blurred backdrop */}
                            <img
                              src={video.thumbnailUrl || fallbackThumbnail}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-30 pointer-events-none"
                            />
                            <div className="absolute inset-0 bg-black/40" />

                            {/* Centered vertical 9:16 poster */}
                            <img
                              src={video.thumbnailUrl || fallbackThumbnail}
                              alt={video.title}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = fallbackThumbnail;
                              }}
                              className="h-full aspect-[9/16] object-cover relative rounded shadow-xl border-x border-white/10"
                            />

                            <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-white/95 text-[10px] font-mono font-medium tracking-wide border border-white/20 shadow-xs">
                                {video.categoryLabel || 'Shorts'}
                              </span>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-11 h-11 rounded-full bg-white/95 text-zinc-950 flex items-center justify-center shadow-lg">
                                <Play className="w-4 h-4 fill-current ml-0.5 text-zinc-950" />
                              </div>
                            </div>
                          </div>

                          <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2.5 min-w-0">
                            <h4
                              title={video.title}
                              className="font-display font-semibold text-xs sm:text-[13px] text-zinc-900 truncate min-w-0 flex-1 leading-snug"
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
                    }

                    // Standard landscape card on mobile for longform video
                    return (
                      <div
                        key={`mob-vid-${video.id}`}
                        id={`mob-video-card-${video.id}`}
                        onClick={() => onOpenVideoModal(video)}
                        className="group shrink-0 w-[84vw] sm:w-[380px] snap-start flex flex-col rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition-all duration-300 overflow-hidden cursor-pointer"
                      >
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
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/5" />
                          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white/95 text-[10px] font-mono font-medium tracking-wide border border-white/20 shadow-xs">
                              {video.categoryLabel || video.category}
                            </span>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-90">
                            <div className="w-11 h-11 rounded-full bg-white/95 text-zinc-950 flex items-center justify-center shadow-lg">
                              <Play className="w-4 h-4 fill-current ml-0.5 text-zinc-950" />
                            </div>
                          </div>
                        </div>

                        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2.5 min-w-0">
                          <h4
                            title={video.title}
                            className="font-display font-semibold text-xs sm:text-[13px] text-zinc-900 truncate min-w-0 flex-1 leading-snug"
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
                        key={`mob-graph-${graphic.id}`}
                        id={`mob-graphic-card-${graphic.id}`}
                        onClick={() => setSelectedGraphic(graphic)}
                        className="group shrink-0 w-[84vw] sm:w-[380px] snap-start flex flex-col rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition-all duration-300 overflow-hidden cursor-pointer"
                      >
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
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/5" />
                          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white/95 text-[10px] font-mono font-medium tracking-wide border border-white/20 shadow-xs">
                              {graphic.categoryLabel || graphic.category}
                            </span>
                          </div>
                        </div>

                        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2.5 min-w-0">
                          <h4
                            title={graphic.title}
                            className="font-display font-semibold text-xs sm:text-[13px] text-zinc-900 truncate min-w-0 flex-1 leading-snug"
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
                })
              )}
              <div className="w-4 shrink-0 pointer-events-none" aria-hidden="true" />
            </motion.div>
          </div>

          {/* Desktop Display */}
          <div className="hidden md:block relative">
            {/* Left Arrow Button */}
            {totalPages > 1 && (
              <button
                id="work-arrow-prev"
                type="button"
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                aria-label="Previous work page"
                className={`absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/95 text-zinc-700 hover:text-zinc-950 border border-zinc-200/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_-2px_rgba(0,0,0,0.18)] backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none hover:scale-105 active:scale-95 group/arrow`}
              >
                <ChevronLeft className="w-6 h-6 transition-transform duration-200 group-hover/arrow:-translate-x-0.5" />
              </button>
            )}

            {/* Right Arrow Button */}
            {totalPages > 1 && (
              <button
                id="work-arrow-next"
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                aria-label="Next work page"
                className={`absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/95 text-zinc-700 hover:text-zinc-950 border border-zinc-200/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_-2px_rgba(0,0,0,0.18)] backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none hover:scale-105 active:scale-95 group/arrow`}
              >
                <ChevronRight className="w-6 h-6 transition-transform duration-200 group-hover/arrow:translate-x-0.5" />
              </button>
            )}

            {/* Animated Grid with Drag Support */}
            <div className="overflow-hidden py-2 -my-2">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`desktop-${currentTab}-page-${currentPage}`}
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({
                      opacity: 0,
                      x: dir > 0 ? 30 : dir < 0 ? -30 : 0,
                      filter: 'blur(4px)',
                    }),
                    center: {
                      opacity: 1,
                      x: 0,
                      filter: 'blur(0px)',
                    },
                    exit: (dir: number) => ({
                      opacity: 0,
                      x: dir > 0 ? -30 : dir < 0 ? 30 : 0,
                      filter: 'blur(4px)',
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  drag={totalPages > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.16}
                  onDragStart={() => {
                    dragDistanceRef.current = 0;
                    isDraggingRef.current = false;
                  }}
                  onDrag={(_, info) => {
                    dragDistanceRef.current += Math.abs(info.delta.x);
                    if (dragDistanceRef.current > 8) {
                      isDraggingRef.current = true;
                    }
                  }}
                  onDragEnd={(_, info) => {
                    const threshold = 40;
                    const velocityThreshold = 180;
                    if (
                      (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) &&
                      currentPage < totalPages - 1
                    ) {
                      setDirection(1);
                      setCurrentPage((prev) => prev + 1);
                    } else if (
                      (info.offset.x > threshold || info.velocity.x > velocityThreshold) &&
                      currentPage > 0
                    ) {
                      setDirection(-1);
                      setCurrentPage((prev) => prev - 1);
                    }
                    setTimeout(() => {
                      isDraggingRef.current = false;
                      dragDistanceRef.current = 0;
                    }, 80);
                  }}
                  className={`${
                    currentTab === 'shorts'
                      ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
                      : 'grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start'
                  } ${totalPages > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                  {visibleItems.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-zinc-500 text-xs font-mono">
                      No projects available in this category yet.
                    </div>
                  ) : (
                    visibleItems.map((item) => {
                      if (item.type === 'video') {
                        const video = item.data;
                        const isShort = isShortFormVideo(video);

                        // 1. If viewing dedicated Shorts tab: Render Full Vertical Show Card
                        if (currentTab === 'shorts') {
                          return (
                            <div
                              key={`vid-short-${video.id}`}
                              id={`video-short-card-${video.id}`}
                              onClick={() => {
                                if (isDraggingRef.current) return;
                                onOpenVideoModal(video);
                              }}
                              className="group relative flex flex-col rounded-2xl bg-zinc-950 text-white border border-zinc-200/80 hover:border-zinc-400 hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 overflow-hidden cursor-pointer select-none aspect-[9/16]"
                            >
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

                              {/* Top Badges */}
                              <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-end z-10 pointer-events-none">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/15 truncate max-w-[120px]">
                                  {video.categoryLabel || 'Shorts'}
                                </span>
                              </div>

                              {/* Center Play Button with Hover Bloom */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 rounded-full bg-white/95 text-zinc-950 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-200">
                                  <Play className="w-5 h-5 fill-current ml-0.5 text-zinc-950" />
                                </div>
                              </div>

                              {/* Bottom Details Overlay */}
                              <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 pt-12 bg-gradient-to-t from-black/95 via-black/75 to-transparent z-10 pointer-events-none flex flex-col gap-1">
                                <h4
                                  title={video.title}
                                  className="font-display font-semibold text-xs sm:text-[13px] text-white line-clamp-2 leading-snug group-hover:text-zinc-200 transition-colors"
                                >
                                  {video.title}
                                </h4>
                                <div className="flex items-center justify-between gap-2 mt-0.5">
                                  <span
                                    title={video.client}
                                    className="text-[10px] sm:text-[11px] font-mono text-zinc-300 uppercase tracking-wider truncate font-medium"
                                  >
                                    {video.client}
                                  </span>
                                  {(video.views || video.duration) && (
                                    <span className="text-[10px] font-mono text-emerald-400 font-semibold shrink-0">
                                      {video.views || video.duration}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // 2. If short-form video in mixed grid (All Work or Videos): Render in standard landscape card (aspect-video)
                        if (isShort) {
                          return (
                            <div
                              key={`vid-${video.id}`}
                              id={`video-card-${video.id}`}
                              onClick={() => {
                                if (isDraggingRef.current) return;
                                onOpenVideoModal(video);
                              }}
                              className="group flex flex-col rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden cursor-pointer select-none"
                            >
                              <div className="relative overflow-hidden bg-zinc-950 aspect-video w-full pointer-events-none flex items-center justify-center">
                                {/* Ambient blurred backdrop */}
                                <img
                                  src={video.thumbnailUrl || fallbackThumbnail}
                                  alt=""
                                  aria-hidden="true"
                                  className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-30 pointer-events-none"
                                />
                                <div className="absolute inset-0 bg-black/40" />

                                {/* Centered 9:16 vertical poster */}
                                <img
                                  src={video.thumbnailUrl || fallbackThumbnail}
                                  alt={video.title}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = fallbackThumbnail;
                                  }}
                                  className="h-full aspect-[9/16] object-cover relative rounded shadow-xl border-x border-white/10 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                />

                                <div className="absolute top-2.5 right-2.5 z-10">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white/95 text-[10px] font-mono font-medium tracking-wide border border-white/20 shadow-xs">
                                    {video.categoryLabel || 'Shorts'}
                                  </span>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                  <div className="w-12 h-12 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                                    <Play className="w-5 h-5 fill-current ml-0.5 text-zinc-950" />
                                  </div>
                                </div>
                              </div>

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
                        }

                        // 3. Standard Horizontal Video Card
                        return (
                          <div
                            key={`vid-${video.id}`}
                            id={`video-card-${video.id}`}
                            onClick={() => {
                              if (isDraggingRef.current) return;
                              onOpenVideoModal(video);
                            }}
                            className="group flex flex-col rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden cursor-pointer select-none"
                          >
                            <div className="relative overflow-hidden bg-zinc-100 aspect-video w-full pointer-events-none">
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

                              <div className="absolute top-2.5 right-2.5 z-10">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white/95 text-[10px] font-mono font-medium tracking-wide border border-white/20 shadow-xs">
                                  {video.categoryLabel || video.category}
                                </span>
                              </div>

                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <div className="w-12 h-12 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                                  <Play className="w-5 h-5 fill-current ml-0.5 text-zinc-950" />
                                </div>
                              </div>
                            </div>

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
                        // Graphic Design Card
                        const graphic = item.data;
                        const graphicSrc =
                          (graphic.imageUrl && graphic.imageUrl.trim()) || fallbackGraphic;

                        return (
                          <div
                            key={`graph-${graphic.id}`}
                            id={`graphic-card-${graphic.id}`}
                            onClick={() => {
                              if (isDraggingRef.current) return;
                              setSelectedGraphic(graphic);
                            }}
                            className="group flex flex-col rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden cursor-pointer select-none"
                          >
                            <div className="relative overflow-hidden bg-zinc-100 aspect-video w-full pointer-events-none">
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

                              <div className="absolute top-2.5 right-2.5 z-10">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white/95 text-[10px] font-mono font-medium tracking-wide border border-white/20 shadow-xs">
                                  {graphic.categoryLabel || graphic.category}
                                </span>
                              </div>
                            </div>

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
                    })
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop Bottom Pagination: Centered Page Pill Dots */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100/90 border border-zinc-200/80 shadow-2xs">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={`page-dot-${idx}`}
                      type="button"
                      onClick={() => {
                        setDirection(idx > currentPage ? 1 : -1);
                        setCurrentPage(idx);
                      }}
                      aria-label={`Go to page ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        currentPage === idx
                          ? 'w-6 bg-zinc-900 shadow-2xs'
                          : 'w-2 bg-zinc-300 hover:bg-zinc-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
