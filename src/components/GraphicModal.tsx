import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Sparkles, Tag } from 'lucide-react';
import { GraphicProject } from '../types';

interface GraphicModalProps {
  graphic: GraphicProject | null;
  onClose: () => void;
}

const FALLBACK_GRAPHIC =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85';

export const GraphicModal: React.FC<GraphicModalProps> = ({ graphic, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(() =>
    graphic?.imageUrl?.trim() ? graphic.imageUrl.trim() : FALLBACK_GRAPHIC
  );

  useEffect(() => {
    if (graphic?.imageUrl?.trim()) {
      setImageLoaded(false);
      setImgSrc(graphic.imageUrl.trim());
    } else if (graphic) {
      setImageLoaded(false);
      setImgSrc(FALLBACK_GRAPHIC);
    }
  }, [graphic]);

  // Lock body scroll and register escape hotkey with guaranteed unfreeze cleanup
  useEffect(() => {
    if (!graphic) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [graphic, onClose]);

  if (!graphic) return null;

  const toolList = Array.isArray(graphic.tools)
    ? graphic.tools
    : typeof graphic.tools === 'string'
    ? (graphic.tools as string).split(',').map((t) => t.trim())
    : [];

  const modalNode = (
    <div
      id="graphic-preview-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-zinc-950/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar inside card with single clean close button */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-200 bg-zinc-50/90 shrink-0">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <h3 className="font-display font-semibold text-xs sm:text-sm text-zinc-900 truncate">
              {graphic.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-mono border border-zinc-200">
              {graphic.categoryLabel || graphic.category}
            </span>
            <button
              id="close-graphic-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
              aria-label="Close image preview"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </div>

        {/* Main Visual Canvas Frame in clean off-white studio container */}
        <div className="relative flex-1 bg-zinc-100/70 border-b border-zinc-200/70 flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[380px] max-h-[62vh] p-3 sm:p-6">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100/80 z-10">
              <div className="w-8 h-8 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin mb-3" />
              <span className="text-xs font-mono text-zinc-500">Loading artwork preview...</span>
            </div>
          )}

          {imgSrc ? (
            <img
              src={imgSrc}
              alt={graphic.title || 'Graphic artwork'}
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                if (imgSrc !== FALLBACK_GRAPHIC) {
                  setImgSrc(FALLBACK_GRAPHIC);
                }
                setImageLoaded(true);
              }}
              className={`max-h-full max-w-full object-contain rounded-xl shadow-xs transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : null}
        </div>

        {/* Bottom Details Footer */}
        <div className="p-4 sm:p-6 bg-white text-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 overflow-y-auto max-h-[30vh]">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 flex-wrap">
              <span>{graphic.client || 'Client Project'}</span>
              <span>•</span>
              <span>{graphic.year || '2026'}</span>
              {graphic.aspect && (
                <>
                  <span>•</span>
                  <span className="uppercase">{graphic.aspect}</span>
                </>
              )}
            </div>

            <h4 className="font-display font-bold text-base sm:text-lg text-zinc-950">
              {graphic.title}
            </h4>

            {graphic.description && (
              <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl font-normal leading-relaxed">
                {graphic.description}
              </p>
            )}

            {toolList.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <Tag className="w-3 h-3 text-zinc-400 shrink-0" />
                {toolList.map((tool) => (
                  <span
                    key={tool}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
            <a
              href={imgSrc || graphic.imageUrl || FALLBACK_GRAPHIC}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Open full resolution in new tab"
            >
              <span>View Full</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
