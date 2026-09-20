import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play } from 'lucide-react';
import { VideoProject } from '../types';
import { isShortFormVideo, parseVideoUrl } from '../lib/videoEmbed';
import { extractYouTubeId } from '../lib/youtube';

interface VideoModalProps {
  project: VideoProject | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [project, onClose]);

  if (!project) return null;

  const isVertical = isShortFormVideo(project);
  
  // Resolve guaranteed working embed URL for YouTube videos/shorts and external embeds
  let iframeSrc: string | null = null;
  const ytId =
    project.youtubeId?.trim() ||
    extractYouTubeId(project.embedUrl || '') ||
    extractYouTubeId((project as any).youtubeUrl || '');

  if (ytId) {
    iframeSrc = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`;
  } else if (project.embedUrl?.trim()) {
    const raw = project.embedUrl.trim();
    const parsed = parseVideoUrl(raw);
    if (parsed.embedUrl) {
      const sep = parsed.embedUrl.includes('?') ? '&' : '?';
      iframeSrc = `${parsed.embedUrl}${sep}autoplay=1&enablejsapi=1`;
    } else {
      const sep = raw.includes('?') ? '&' : '?';
      iframeSrc = `${raw}${sep}autoplay=1&enablejsapi=1`;
    }
  }

  const tags = (project.tags || [])
    .map((t) => t.replace(/^#/, '').trim())
    .filter(Boolean);

  const modalNode = (
    <div
      id="video-theater-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      {isVertical ? (
        /* Vertical Video Layout: Side-by-side on sm+ screens so info card is beside the video without fighting for vertical space */
        <div
          className="relative w-full max-w-lg sm:max-w-3xl md:max-w-4xl max-h-[94vh] sm:max-h-[85vh] bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col sm:flex-row transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Vertical Video Frame: On mobile, rendered with authentic 9:16 vertical proportions and height */}
          <div className="relative bg-zinc-950 flex items-center justify-center shrink-0 w-full sm:w-[310px] md:w-[350px] lg:w-[390px] overflow-hidden border-b sm:border-b-0 sm:border-r border-zinc-200/80">
            <div className="w-full h-[50vh] min-h-[320px] max-h-[460px] sm:h-auto sm:aspect-[9/16] sm:max-h-[85vh] flex items-center justify-center mx-auto bg-black">
              {iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  title={project.title}
                  className="h-full aspect-[9/16] max-w-full sm:w-full border-0 mx-auto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
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
          </div>

          {/* Info Card (Placed beside vertical video on right) */}
          <div className="flex-1 flex flex-col justify-between p-5 sm:p-7 md:p-8 bg-white min-w-0 overflow-y-auto max-h-[46vh] sm:max-h-[85vh]">
            <div className="space-y-4">
              {/* Top Row: Category Pill & Close Button */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] sm:text-[11px] font-mono text-zinc-700 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 shrink-0 font-medium">
                  {project.categoryLabel || 'Shorts'}
                </span>
                <button
                  id="close-video-modal-btn"
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                  aria-label="Close theater"
                >
                  <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
              </div>

              {/* Title & Client Subtitle */}
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-zinc-900 leading-snug">
                  {project.title}
                </h3>
                <p className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium mt-1">
                  {project.client}
                </p>
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-normal">
                  {project.description}
                </p>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-mono border border-zinc-200/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Meta Bar */}
            {(project.duration || project.role || project.views) && (
              <div className="pt-4 mt-6 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>{project.role || 'Short-Form Editor'}</span>
                {project.views && (
                  <span className="text-emerald-600 font-semibold">{project.views}</span>
                )}
                {project.duration && <span>{project.duration}</span>}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Standard Horizontal Video Layout */
        <div
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
                id="close-video-modal-btn"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                aria-label="Close theater"
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
                  src={iframeSrc}
                  title={project.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
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
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
