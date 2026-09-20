import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Play,
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Reset drawer state when project changes
  useEffect(() => {
    setShowInfo(false);
  }, [project]);

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
           IMMERSIVE VERTICAL (9:16) THEATER:
           - On PC / larger screens (md+): Side-by-side layout with Project Info
             permanently open beside the vertical video. Zero UI overlapping the video.
           - On mobile (< md): Clean full-height player with top chrome & dedicated bottom
             bar. ONE button at the bottom named "Project Info". No UI covering YouTube
             controls (settings, volume, captions, timeline).
           ========================================================================= */
        <div
          ref={containerRef}
          className="relative w-full h-[100dvh] sm:h-[94vh] max-h-[960px] md:max-w-4xl lg:max-w-5xl md:h-[86vh] md:max-h-[820px] bg-zinc-950 sm:border sm:border-zinc-800/90 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 my-auto text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Chrome Header Bar - Outside of Video Frame */}
          <div className="shrink-0 h-13 px-4 sm:px-6 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md z-20">
            <div className="flex items-center gap-2.5 min-w-0 pr-3">
              <span className="text-[10px] sm:text-[11px] font-mono text-zinc-300 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 font-medium shrink-0">
                {project.categoryLabel || 'Shorts'}
              </span>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold truncate">
                {project.client}
              </span>
            </div>

            {/* Top Right Controls: Close Button ONLY */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="close-video-modal-btn"
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer shadow-xs"
                aria-label="Close video"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row md:items-center md:justify-center p-0 md:p-6 md:gap-6 overflow-hidden relative">
            {/* 9:16 Vertical Video Frame (Completely unobstructed, zero overlapping buttons) */}
            <div className="flex-1 md:flex-none h-full md:h-full md:max-h-[720px] aspect-[9/16] bg-black md:rounded-2xl overflow-hidden md:border md:border-zinc-800/90 relative shadow-xl mx-auto flex items-center justify-center">
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

            {/* Desktop / PC Project Info Panel - Cleanly opened BESIDE the vertical video */}
            <div className="hidden md:flex flex-1 h-full max-h-[720px] bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    {project.client}
                  </p>
                  <h3 className="font-display font-bold text-lg lg:text-xl text-white leading-snug">
                    {project.title}
                  </h3>
                </div>

                {project.description && (
                  <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-normal">
                    {project.description}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
                    {tags.map((tag, idx) => (
                      <span
                        key={`${tag}-${idx}`}
                        className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 text-[11px] font-mono border border-zinc-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>{project.role || 'Short-Form Editor'}</span>
                  {project.duration && <span>{project.duration}</span>}
                </div>

                {directExternalLink && (
                  <a
                    href={directExternalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs transition-colors hover:bg-zinc-200 shadow-md cursor-pointer"
                  >
                    <span>Watch on YouTube / Shorts</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Dedicated Bottom Bar (< md only) - Sits BELOW the video frame so YouTube controls are never covered */}
          <div className="md:hidden shrink-0 h-13 px-4 flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/95 z-20">
            <div
              className="min-w-0 pr-3 cursor-pointer"
              onClick={() => setShowInfo(true)}
            >
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold truncate">
                {project.client}
              </p>
              <h4 className="font-display font-semibold text-xs text-white truncate">
                {project.title}
              </h4>
            </div>

            {/* Single button: "Project Info" */}
            <button
              type="button"
              onClick={() => setShowInfo((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-mono font-medium transition-colors border border-zinc-700 shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Project Info</span>
              {showInfo ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Mobile Project Info Bottom Sheet (< md only) - Slides up on demand */}
          {showInfo && (
            <div
              className="md:hidden absolute inset-x-0 bottom-0 max-h-[75%] bg-zinc-950/98 backdrop-blur-2xl border-t border-zinc-800 text-white rounded-t-3xl p-5 z-40 flex flex-col shadow-2xl animate-in slide-in-from-bottom-6 duration-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/80 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded-full bg-zinc-700 mr-1" />
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    {project.client}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInfo(false)}
                  className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800"
                  aria-label="Minimize details"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto pr-1 space-y-3.5 overscroll-contain">
                <h3 className="font-display font-bold text-base text-white leading-snug">
                  {project.title}
                </h3>

                {project.description && (
                  <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                    {project.description}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
                    {tags.map((tag, idx) => (
                      <span
                        key={`${tag}-${idx}`}
                        className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
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
           CINEMATIC HORIZONTAL (16:9) LANDSCAPE THEATER:
           - Matching dark cinema styling (no outdated white cards).
           - Clean separation between the video preview and contained project details.
           - Zero UI elements overlapping the video frame — YouTube controls (settings,
             volume, captions, timeline, fullscreen) are completely accessible.
           - On desktop (lg+): Side-by-side widescreen layout with contained details.
           - On mobile / tablet (< lg): Stacks cleanly with unobstructed player on top.
           ========================================================================= */
        <div
          ref={containerRef}
          className="relative w-full h-full sm:h-[94vh] sm:max-w-6xl lg:max-w-7xl xl:max-w-[1520px] 2xl:max-w-[1680px] bg-zinc-950 sm:border sm:border-zinc-800/90 sm:rounded-3xl shadow-2xl my-auto flex flex-col overflow-hidden transition-all duration-300 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Chrome Header Bar */}
          <div className="shrink-0 h-13 px-4 sm:px-6 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md z-20">
            <div className="flex items-center gap-2.5 min-w-0 pr-3">
              <span className="text-[10px] sm:text-[11px] font-mono text-zinc-300 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 font-medium shrink-0">
                {project.categoryLabel || project.category}
              </span>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold truncate">
                {project.client}
              </span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <h3 className="font-display font-semibold text-xs sm:text-sm text-white truncate hidden sm:inline">
                {project.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="close-video-modal-btn"
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer shadow-xs active:scale-95"
                aria-label="Close video"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Cinema Video Stage: 16:9 player expands to fit viewport cleanly without distortion */}
          <div
            className="flex-1 min-h-0 w-full h-full p-2 sm:p-4 md:p-6 flex items-center justify-center overflow-hidden relative cursor-default"
            onClick={() => {
              if (showInfo) setShowInfo(false);
            }}
          >
            <div className="w-full h-full max-w-full max-h-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800/90 relative shadow-2xl flex items-center justify-center">
              {iframeSrc ? (
                <iframe
                  ref={iframeRef}
                  src={iframeSrc}
                  title={project.title}
                  className="w-full h-full border-0 absolute inset-0"
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
                    {project.title} • Video Preview
                  </h4>
                  <p className="text-zinc-500 font-mono text-[11px] sm:text-xs mt-1 max-w-sm">
                    Placeholder video slot — custom client cuts and raw footage review available upon project consultation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Clean, uncluttered metadata & actions */}
          <div className="shrink-0 h-14 px-4 sm:px-6 flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/95 z-20">
            <div
              className="min-w-0 pr-3 cursor-pointer select-none"
              onClick={() => setShowInfo((prev) => !prev)}
            >
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold truncate">
                {project.client} {project.role ? `• ${project.role}` : ''}
              </p>
              <h4 className="font-display font-semibold text-xs sm:text-sm text-white truncate">
                {project.title} {project.duration ? `(${project.duration})` : ''}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {directExternalLink && (
                <a
                  href={directExternalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-medium transition-colors border border-zinc-800 cursor-pointer shadow-xs active:scale-95"
                  title="Watch on YouTube"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Project Info toggle button */}
              <button
                id="toggle-video-info-btn"
                type="button"
                onClick={() => setShowInfo((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-medium transition-colors border border-zinc-700 shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                <span>Project Info</span>
                {showInfo ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Project Info Bottom Sheet - Slides up on demand */}
          {showInfo && (
            <div
              className="absolute inset-x-0 bottom-0 max-h-[75%] bg-zinc-950/98 backdrop-blur-2xl border-t border-zinc-800 text-white rounded-t-3xl p-5 sm:p-6 z-40 flex flex-col shadow-2xl animate-in slide-in-from-bottom-6 duration-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/80 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 rounded-full bg-zinc-700 mr-1" />
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    {project.client}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {(project.categoryLabel || project.category) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] sm:text-[11px] font-mono border border-zinc-700 font-medium">
                      {project.categoryLabel || project.category}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowInfo(false)}
                    className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800"
                    aria-label="Minimize details"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto pr-1 space-y-3.5 overscroll-contain">
                <h3 className="font-display font-bold text-base sm:text-lg text-white leading-snug">
                  {project.title}
                </h3>

                {project.description && (
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                    {project.description}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
                    {tags.map((tag, idx) => (
                      <span
                        key={`${tag}-${idx}`}
                        className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 text-[11px] font-mono border border-zinc-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] sm:text-xs font-mono text-zinc-400">
                  <span>{project.role || 'Lead Video Editor'}</span>
                  {project.duration && <span>{project.duration}</span>}
                </div>

                {directExternalLink && (
                  <div className="pt-3 border-t border-zinc-800/80">
                    <a
                      href={directExternalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs transition-colors hover:bg-zinc-200 shadow-md cursor-pointer"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
