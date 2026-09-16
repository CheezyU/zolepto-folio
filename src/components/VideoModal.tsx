import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Clock, Layers } from 'lucide-react';
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
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [project, onClose]);

  if (!project) return null;

  // Build clean autoplay iframe embed url
  const separator = project.embedUrl.includes('?') ? '&' : '?';
  const iframeSrc = `${project.embedUrl}${separator}autoplay=1&enablejsapi=1`;

  const modalNode = (
    <div
      id="video-theater-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar of modal with sticky close button */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shrink-0" />
            <h3 className="font-display font-bold text-sm sm:text-base text-zinc-900 truncate">
              {project.title}
            </h3>
            <span className="hidden md:inline-block text-[11px] font-mono text-zinc-600 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 shrink-0">
              {project.categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.youtube.com/watch?v=${project.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-mono text-zinc-700 hover:text-zinc-950 transition-colors"
              title="Open directly on YouTube"
            >
              <span>YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              id="close-video-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
              aria-label="Close theater"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Embed Frame */}
        <div className="relative aspect-video w-full bg-zinc-950 shrink-0">
          <iframe
            src={iframeSrc}
            title={project.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video details & editorial notes with internal scroll for mobile */}
        <div className="p-4 sm:p-8 bg-white space-y-4 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium">
                Client / Project: {project.client} • {project.year}
              </p>
              <h4 className="text-xl font-display font-bold text-zinc-900 mt-1">
                {project.title}
              </h4>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-zinc-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Runtime: {project.duration}</span>
              </div>
              {project.metrics && (
                <div className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 font-medium">
                  {project.metrics}
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-zinc-600 leading-relaxed font-normal">
            {project.description}
          </p>

          <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500">Role in Production:</span>
              <span className="text-zinc-900 font-medium">{project.role}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-mono border border-zinc-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
