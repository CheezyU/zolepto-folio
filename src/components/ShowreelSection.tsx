import React, { useState } from 'react';
import { Play, ExternalLink, Maximize2 } from 'lucide-react';
import { MAIN_SHOWREEL, VIDEO_PROJECTS } from '../data/portfolioData';
import { VideoCategory, VideoProject } from '../types';

interface ShowreelSectionProps {
  onOpenVideoModal: (project: VideoProject) => void;
  projects?: VideoProject[];
}

const CATEGORIES: { id: VideoCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'narrative', label: 'Narrative' },
  { id: 'short-form', label: 'Short-Form' },
  { id: 'motion', label: 'Motion' },
];

export const ShowreelSection: React.FC<ShowreelSectionProps> = ({
  onOpenVideoModal,
  projects = VIDEO_PROJECTS,
}) => {
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('all');
  const [isPlayingMaster, setIsPlayingMaster] = useState(false);

  const filteredVideos =
    activeCategory === 'all'
      ? projects
      : projects.filter((v) => v.category === activeCategory);

  const fallbackThumbnail = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80';

  return (
    <section id="showreels" className="py-20 sm:py-28 relative border-t border-zinc-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Clean, direct 1-word heading with no dramatic eyebrows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
              Showreels
            </h2>
          </div>

          <p className="text-zinc-600 text-sm sm:text-base max-w-md leading-relaxed font-normal">
            Streaming via responsive embed frames & verified YouTube cuts. Lightweight playback engineered for instant immersion.
          </p>
        </div>

        {/* Master Showreel - Featured Hero Embed Frame */}
        <div className="mb-20">
          <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
            {/* Top Bar of the Player */}
            <div className="px-5 sm:px-8 py-3.5 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-semibold tracking-wide">
                  Featured 2026 Master Reel
                </span>
                <span className="text-xs font-mono text-zinc-500 font-medium">
                  {MAIN_SHOWREEL.duration} • 4K ProRes Grade
                </span>
              </div>

              <div className="flex items-center gap-3">
                {isPlayingMaster && MAIN_SHOWREEL.embedUrl && (
                  <button
                    onClick={() => setIsPlayingMaster(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-xs font-mono text-zinc-800 transition-colors cursor-pointer"
                  >
                    <span>Stop Playback</span>
                  </button>
                )}

                {MAIN_SHOWREEL.youtubeId && (
                  <a
                    href={`https://www.youtube.com/watch?v=${MAIN_SHOWREEL.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <span>YouTube Direct</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  id="expand-master-reel-btn"
                  onClick={() => onOpenVideoModal(MAIN_SHOWREEL)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                  title="Expand to Full Theater"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Theater View</span>
                </button>
              </div>
            </div>

            {/* Responsive Player Area: Poster Mode or Active Embed */}
            <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
              {isPlayingMaster ? (
                <iframe
                  src={`${MAIN_SHOWREEL.embedUrl}&autoplay=1`}
                  title={MAIN_SHOWREEL.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div
                  className="group relative w-full h-full cursor-pointer flex items-center justify-center select-none"
                  onClick={() => {
                    if (MAIN_SHOWREEL.embedUrl) {
                      setIsPlayingMaster(true);
                    } else {
                      onOpenVideoModal(MAIN_SHOWREEL);
                    }
                  }}
                >
                  <img
                    src={MAIN_SHOWREEL.thumbnailUrl}
                    alt={MAIN_SHOWREEL.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackThumbnail;
                    }}
                    className="w-full h-full object-cover grayscale contrast-110 transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:via-black/30 transition-colors" />

                  {/* Centered Large Interactive Play Button */}
                  <div className="absolute flex flex-col items-center gap-3">
                    <button
                      type="button"
                      id="master-reel-play-btn"
                      className="w-20 h-20 rounded-full bg-white/95 text-zinc-950 shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white cursor-pointer"
                      aria-label="Play Master Reel"
                    >
                      <Play className="w-8 h-8 fill-current ml-1 text-zinc-950" />
                    </button>
                    <div className="text-center">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-xs tracking-wider uppercase font-semibold">
                        {MAIN_SHOWREEL.embedUrl ? 'Click to Play Stream' : 'Click to View Reel Preview'} • {MAIN_SHOWREEL.duration}
                      </span>
                    </div>
                  </div>

                  {/* Corner hint */}
                  <div className="absolute bottom-4 left-4 sm:left-6 text-white text-xs font-mono opacity-80">
                    4K Master Cut • Directed & Cut by Zolepto
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Meta & Breakdown of Master Reel */}
            <div className="p-6 sm:p-8 bg-white border-t border-zinc-200 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2.5">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-zinc-900">
                  {MAIN_SHOWREEL.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  {MAIN_SHOWREEL.description}
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {MAIN_SHOWREEL.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-zinc-200 md:pl-6 space-y-3 flex flex-col justify-center">
                <div>
                  <span className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                    Editorial Role
                  </span>
                  <p className="text-xs font-medium text-zinc-800 mt-0.5">
                    {MAIN_SHOWREEL.role}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                    Performance Metric
                  </span>
                  <p className="text-xs font-semibold text-zinc-900 mt-0.5">
                    {MAIN_SHOWREEL.metrics}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-10 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-filter-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 border border-zinc-200/80'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-zinc-500">
            Showing {filteredVideos.length} Project Cuts
          </div>
        </div>

        {/* Video Grid - Click anywhere on the card to open the full theater modal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              id={`video-card-${video.id}`}
              onClick={() => onOpenVideoModal(video)}
              className="group flex flex-col rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Image Preview Thumbnail */}
              <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackThumbnail;
                  }}
                  className="w-full h-full object-cover grayscale contrast-110 transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Runtime Badge */}
                <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[11px] font-mono text-white font-medium">
                  {video.duration}
                </span>

                {/* Client / Category Tag */}
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-zinc-900 shadow-sm">
                  {video.categoryLabel}
                </span>

                {/* Hover Play Indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Card Content & Details */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5 font-medium">
                    <span>{video.client}</span>
                    <span>{video.year}</span>
                  </div>

                  <h4 className="font-display font-bold text-base sm:text-lg text-zinc-900 group-hover:text-zinc-700 transition-colors leading-snug">
                    {video.title}
                  </h4>

                  <p className="mt-2 text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed font-normal">
                    {video.description}
                  </p>
                </div>

                {/* Footer of Card with Metric & YouTube Link */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-700 truncate max-w-[170px]">
                    {video.metrics || video.role}
                  </span>

                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
                    title="Open on YouTube"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
