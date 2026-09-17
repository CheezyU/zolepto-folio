import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play } from 'lucide-react';
import { VideoProject } from '../types';

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

  const validEmbedUrl = project?.embedUrl?.trim();
  const iframeSrc = validEmbedUrl
    ? `${validEmbedUrl}${validEmbedUrl.includes('?') ? '&' : '?'}autoplay=1&enablejsapi=1`
    : null;

  const tags = (project.tags || [])
    .map((t) => t.replace(/^#/, '').trim())
    .filter(Boolean);

  const modalNode = (
    <div
      id="video-theater-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar: Title breathes freely, no dot blob, no category pill, no YouTube button */}
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

        {/* Video Embed Frame: Height-capped on PC so it never squashes details below */}
        <div className="relative w-full bg-zinc-950 flex items-center justify-center shrink-0 max-h-[46vh] sm:max-h-[50vh] overflow-hidden">
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

        {/* Full Details: Subtitle & Category Pill, Description, and Static Read-Only Tags */}
        {/* Zero inner scroll: Everything visible at a single glance with proper vertical breathing room */}
        <div className="p-4 sm:p-6 bg-white space-y-3 shrink-0">
          {/* Subtitle row with Client on left and Category Pill on right */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium">
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

          {/* Clean row of read-only tags (strictly controlled via Admin Panel) */}
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
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
