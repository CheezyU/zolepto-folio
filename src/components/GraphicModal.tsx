import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
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

  // Lock body scroll and register escape hotkey
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

  const rawTools = Array.isArray(graphic.tools)
    ? graphic.tools
    : typeof graphic.tools === 'string'
    ? (graphic.tools as string).split(',').map((t) => t.trim())
    : [];
  const tags = rawTools.map((t) => t.replace(/^#/, '').trim()).filter(Boolean);

  const modalNode = (
    <div
      id="graphic-preview-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar: Title breathes freely, no dot blob, no category pill */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-200 bg-zinc-50/90 shrink-0">
          <div className="min-w-0 pr-3">
            <h3 className="font-display font-semibold text-xs sm:text-sm text-zinc-900 truncate">
              {graphic.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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

        {/* Main Visual Canvas Frame: Height-capped on PC so bottom details have comfortable breathing room */}
        <div className="relative bg-zinc-100/70 border-b border-zinc-200/70 flex items-center justify-center overflow-hidden h-[40vh] sm:h-[46vh] max-h-[48vh] p-3 sm:p-4 shrink-0">
          {!imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100/80 z-10">
              <div className="w-7 h-7 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin mb-2" />
              <span className="text-[11px] font-mono text-zinc-500">Loading artwork...</span>
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
              className={`max-h-full max-w-full object-contain rounded-lg shadow-xs transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : null}
        </div>

        {/* Full Details: Subtitle & Category Pill, Description, Read-Only Tags, View Full */}
        {/* Zero inner scroll: Everything visible at a single glance with proper vertical breathing room */}
        <div className="p-4 sm:p-6 bg-white text-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-2 min-w-0 flex-1">
            {/* Subtitle row with Client on left and Category Pill on right */}
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium">
                {graphic.client || 'Studio Work'}
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] sm:text-[11px] font-mono border border-zinc-200 shrink-0 font-medium">
                {graphic.categoryLabel || graphic.category}
              </span>
            </div>

            {graphic.description && (
              <p className="text-xs sm:text-[13px] text-zinc-600 max-w-2xl font-normal leading-relaxed">
                {graphic.description}
              </p>
            )}

            {/* Clean row of read-only tags (strictly controlled via Admin Panel) */}
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-zinc-100">
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

          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 self-end sm:self-center">
            <a
              href={imgSrc || graphic.imageUrl || FALLBACK_GRAPHIC}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
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
