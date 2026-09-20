import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Play,
  Maximize2,
  Minimize2,
  Info,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { VideoProject } from '../types';
import { isShortFormVideo, parseVideoUrl } from '../lib/videoEmbed';
import { extractYouTubeId, forceYouTubeHighestQuality } from '../lib/youtube';

interface VideoModalProps {
  project: VideoProject | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ project, onClose }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Reset drawer and fullscreen state when project changes
  useEffect(() => {
    setShowInfo(false);
  }, [project]);

  // Handle hardware fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleNativeFullscreen = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch {
      // Browser prevented fullscreen or not supported
    }
  };

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInfo) {
          setShowInfo(false);
        } else {
          onClose();
        }
      }
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [project, onClose, showInfo]);

  // Resolve guaranteed working embed URL for YouTube and external video embeds
  const ytId = project
    ? project.youtubeId?.trim() ||
      extractYouTubeId(project.embedUrl || '') ||
      extractYouTubeId((project as any).youtubeUrl || '')
    : null;

  let iframeSrc: string | null = null;
  if (project) {
    if (ytId) {
      // Force 1080p/highres parameters & enable JS API
      iframeSrc = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&vq=hd1080&hd=1&playsinline=1`;
    } else if (project.embedUrl?.trim()) {
      const raw = project.embedUrl.trim();
      const parsed = parseVideoUrl(raw);
      const base = parsed.embedUrl || raw;
      const sep = base.includes('?') ? '&' : '?';
      iframeSrc = `${base}${sep}autoplay=1&enablejsapi=1&vq=hd1080&hd=1&playsinline=1`;
    }
  }

  // Actively enforce highest playback quality (1080p / 1440p / 4K) automatically via YouTube API
  useEffect(() => {
    if (!project || !iframeSrc) return;

    const enforce = () => {
      forceYouTubeHighestQuality(iframeRef.current);
    };

    // Send quality enforcement immediately upon load, and subsequently after player buffering
    const t0 = setTimeout(enforce, 400);
    const t1 = setTimeout(enforce, 1000);
    const t2 = setTimeout(enforce, 2200);
    const t3 = setTimeout(enforce, 4000);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [iframeSrc, project]);

  if (!project) return null;

  const isVertical = isShortFormVideo(project);

  const tags = (project.tags || [])
    .map((t) => t.replace(/^#/, '').trim())
    .filter(Boolean);

  const directExternalLink =
    (project as any).youtubeUrl ||
    (ytId ? `https://www.youtube.com/watch?v=${ytId}` : project.embedUrl || null);

  const modalNode = (
    <div
      id="video-theater-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-zinc-950/90 backdrop-blur-md overflow-hidden select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {isVertical ? (
        /* =========================================================================
           IMMERSIVE VERTICAL (9:16) REEL THEATER:
           - Fits the device perfectly without black bars
           - Video fills full vertical viewport
           - Force full-screen first
           - Clean toggleable & scrollable project information sheet
           ========================================================================= */
        <div
          ref={containerRef}
          className="relative w-full h-[100dvh] sm:h-[94vh] sm:max-h-[960px] max-w-[min(100vw,calc(100dvh*9/16))] sm:max-w-[calc(94vh*9/16)] aspect-[9/16] bg-black sm:border sm:border-zinc-800/80 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center my-auto transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Edge-to-Edge Vertical Video Frame */}
          <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            {iframeSrc ? (
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                title={project.title}
                className="w-full h-full border-0 absolute inset-0 object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => forceYouTubeHighestQuality(iframeRef.current)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-zinc-950 text-zinc-300 select-none">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3 shadow-inner">
                  <Play className="w-6 h-6 ml-0.5 text-zinc-300" />
                </div>
                <h4 className="font-display font-semibold text-sm sm:text-base text-zinc-100">
                  {project.title}
                </h4>
                <p className="text-zinc-500 font-mono text-[11px] sm:text-xs mt-1 max-w-xs">
                  Vertical short-form cut formatted for mobile discovery, reels & feeds.
                </p>
              </div>
            )}
          </div>

          {/* Top Floating Controls Bar */}
          <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between z-30 pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {/* Category Pill */}
            <span className="text-[10px] sm:text-[11px] font-mono text-zinc-200 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 font-medium shadow-md">
              {project.categoryLabel || 'Shorts'}
            </span>

            {/* Right Action Icons: Fullscreen Toggle, Info Sheet Toggle, and Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleNativeFullscreen}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-zinc-200 hover:text-white backdrop-blur-md border border-white/15 transition-colors cursor-pointer shadow-md"
                aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
                title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowInfo((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                  showInfo
                    ? 'bg-white text-zinc-950 border-white font-semibold'
                    : 'bg-black/60 hover:bg-black/80 text-zinc-200 hover:text-white border-white/15'
                }`}
                aria-label="Toggle project details"
                title="Toggle details sheet"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Info</span>
              </button>

              <button
                id="close-video-modal-btn"
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-zinc-200 hover:text-white backdrop-blur-md border border-white/15 transition-colors cursor-pointer shadow-md"
                aria-label="Close video"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Floating Glance Overlay (When Info sheet is collapsed) */}
          {!showInfo && (
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 pt-16 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 pointer-events-auto flex items-end justify-between gap-3">
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => setShowInfo(true)}
              >
                <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold truncate">
                  {project.client}
                </p>
                <h3 className="font-display font-bold text-sm sm:text-base text-white truncate leading-snug drop-shadow-sm mt-0.5">
                  {project.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowInfo(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-medium transition-all shrink-0 cursor-pointer shadow-lg active:scale-95"
              >
                <span>Project Info</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Scrollable Project Info Bottom Sheet / Drawer */}
          {showInfo && (
            <div
              className="absolute inset-x-0 bottom-0 max-h-[72%] bg-zinc-950/95 backdrop-blur-2xl border-t border-white/20 text-white rounded-t-3xl p-5 sm:p-6 z-30 flex flex-col shadow-[0_-10px_35px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-6 duration-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Pull Tab / Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded-full bg-white/30 mr-1" />
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    {project.client}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInfo(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Minimize details"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto pr-1 space-y-3.5 overscroll-contain">
                {/* Title */}
                <h3 className="font-display font-bold text-base sm:text-lg text-white leading-snug">
                  {project.title}
                </h3>

                {/* Description */}
                {project.description && (
                  <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-normal">
                    {project.description}
                  </p>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                    {tags.map((tag, idx) => (
                      <span
                        key={`${tag}-${idx}`}
                        className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 text-[11px] font-mono border border-white/10"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Meta & External Link Bar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>{project.role || 'Short-Form Editor'}</span>
                  {project.duration && <span>{project.duration}</span>}
                </div>

                {directExternalLink && (
                  <div className="pt-2">
                    <a
                      href={directExternalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs transition-colors hover:bg-zinc-200 shadow-md cursor-pointer"
                    >
                      <span>Watch on YouTube / Shorts</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
           STANDARD HORIZONTAL (16:9) THEATER:
           - Clean, distraction-free landscape player
           - HD quality enforcement
           - Fullscreen toggle & clean details
           ========================================================================= */
        <div
          ref={containerRef}
          className="relative w-full max-w-4xl bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-200/90 bg-white sticky top-0 z-10 shrink-0">
            <div className="min-w-0 pr-3">
              <h3 className="font-display font-bold text-xs sm:text-sm text-zinc-900 truncate">
                {project.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleNativeFullscreen}
                className="p-1.5 sm:p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
                title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button
                id="close-video-modal-btn"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                aria-label="Close theater"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
          </div>

          {/* Video Embed Frame */}
          <div className="relative w-full bg-zinc-950 flex items-center justify-center shrink-0 overflow-hidden">
            <div className="w-full aspect-video max-h-[46vh] sm:max-h-[50vh]">
              {iframeSrc ? (
                <iframe
                  ref={iframeRef}
                  src={iframeSrc}
                  title={project.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => forceYouTubeHighestQuality(iframeRef.current)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-zinc-950 text-zinc-300 select-none">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3 shadow-inner">
                    <Play className="w-6 h-6 ml-0.5 text-zinc-300" />
                  </div>
                  <h4 className="font-display font-semibold text-sm sm:text-base text-zinc-100">
                    {project.title} • Video Preview
                  </h4>
                  <p className="text-zinc-500 font-mono text-[11px] sm:text-xs mt-1 max-w-sm">
                    Placeholder video slot — custom client cuts and raw footage review available upon project consultation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Full Details */}
          <div className="p-4 sm:p-6 bg-white space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium truncate">
                {project.client}
              </p>
              <span className="text-[10px] sm:text-[11px] font-mono text-zinc-700 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 shrink-0 font-medium">
                {project.categoryLabel || project.category}
              </span>
            </div>

            {project.description && (
              <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-normal">
                {project.description}
              </p>
            )}

            {tags.length > 0 && (
              <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-1.5 sm:gap-2">
                {tags.map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-mono border border-zinc-200/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>{project.role || 'Lead Video Editor'}</span>
              {project.duration && <span>{project.duration}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
