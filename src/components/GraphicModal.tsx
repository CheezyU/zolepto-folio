import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { GraphicProject } from '../types';
import { cleanImageUrl, isImgbbViewerUrl, resolveImgbbViewerUrl } from '../lib/imageUtils';

interface GraphicModalProps {
  graphic: GraphicProject | null;
  onClose: () => void;
}

const FALLBACK_GRAPHIC =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85';

export const GraphicModal: React.FC<GraphicModalProps> = ({ graphic, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  useEffect(() => {
    setImageLoaded(false);
    setShowInfo(false);

    if (!graphic?.imageUrl) {
      setResolvedSrc('');
      return;
    }

    const raw = graphic.imageUrl.trim();
    const cleaned = cleanImageUrl(raw);
    setResolvedSrc(cleaned || FALLBACK_GRAPHIC);

    // If it's an ImgBB viewer link, resolve to direct high-res image
    if (isImgbbViewerUrl(raw)) {
      resolveImgbbViewerUrl(raw)
        .then((direct) => {
          if (direct && direct !== cleaned) {
            setResolvedSrc(direct);
          }
        })
        .catch(() => {
          // Keep current fallback / cleaned URL
        });
    }
  }, [graphic]);

  // Lock body scroll and register escape hotkey
  useEffect(() => {
    if (!graphic) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showInfo) {
          setShowInfo(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [graphic, onClose, showInfo]);

  if (!graphic) return null;

  const displaySrc = resolvedSrc || FALLBACK_GRAPHIC;

  const rawTools = Array.isArray(graphic.tools)
    ? graphic.tools
    : typeof graphic.tools === 'string'
    ? (graphic.tools as string).split(',').map((t) => t.trim())
    : [];
  const tags = rawTools.map((t) => t.replace(/^#/, '').trim()).filter(Boolean);

  const modalNode = (
    <div
      id="graphic-preview-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full sm:h-[94vh] sm:max-w-6xl lg:max-w-7xl bg-zinc-950 sm:rounded-3xl border-0 sm:border sm:border-zinc-800/80 flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar: Clean title & close button, zero clutter */}
        <div className="shrink-0 h-13 px-4 sm:px-6 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 z-20">
          <div className="min-w-0 pr-3 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-white shrink-0" />
            <h3 className="font-display font-semibold text-xs sm:text-sm text-white truncate">
              {graphic.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="close-graphic-modal-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer shadow-xs active:scale-95"
              aria-label="Close image preview"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Artwork Stage: Centerpiece displaying the image scaled up to fit the viewport seamlessly */}
        <div
          className="flex-1 min-h-0 w-full h-full p-2 sm:p-4 md:p-5 flex items-center justify-center overflow-hidden relative cursor-default"
          onClick={() => {
            if (showInfo) setShowInfo(false);
          }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
              <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mb-3" />
              <span className="text-xs font-mono font-medium text-zinc-400">
                Loading full resolution...
              </span>
            </div>
          )}

          {displaySrc ? (
            <img
              src={displaySrc}
              alt={graphic.title || 'Graphic artwork'}
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== FALLBACK_GRAPHIC) {
                  target.src = FALLBACK_GRAPHIC;
                }
                setImageLoaded(true);
              }}
              className={`w-full h-full max-w-full max-h-full object-contain drop-shadow-2xl transition-all duration-300 select-none ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
              }`}
            />
          ) : null}
        </div>

        {/* Bottom Bar: Hiding heavy information by default, matching vertical video info in mobile */}
        <div className="shrink-0 h-14 px-4 sm:px-6 flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/95 z-20">
          <div
            className="min-w-0 pr-3 cursor-pointer select-none"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold truncate">
              {graphic.client || 'Studio Work'}
            </p>
            <h4 className="font-display font-semibold text-xs sm:text-sm text-white truncate">
              {graphic.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={displaySrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-medium transition-colors border border-zinc-800 cursor-pointer shadow-xs active:scale-95"
              title="Open full resolution in new tab"
            >
              <span>Full Res</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Project Info toggle button - Exactly like vertical video on mobile */}
            <button
              id="toggle-graphic-info-btn"
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

        {/* Project Info Bottom Sheet - Slides up on demand, contained like vertical video info in mobile */}
        {showInfo && (
          <div
            className="absolute inset-x-0 bottom-0 max-h-[75%] bg-zinc-950/98 backdrop-blur-2xl border-t border-zinc-800 text-white rounded-t-3xl p-5 sm:p-6 z-40 flex flex-col shadow-2xl animate-in slide-in-from-bottom-6 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 rounded-full bg-zinc-700 mr-1" />
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                  {graphic.client || 'Studio Work'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {(graphic.categoryLabel || graphic.category) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] sm:text-[11px] font-mono border border-zinc-700 font-medium">
                    {graphic.categoryLabel || graphic.category}
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
                {graphic.title}
              </h3>

              {graphic.description && (
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  {graphic.description}
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

              <div className="pt-4 border-t border-zinc-800/80">
                <a
                  href={displaySrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs transition-colors hover:bg-zinc-200 shadow-md cursor-pointer"
                >
                  <span>Open Full Resolution (Original)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
