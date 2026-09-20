import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { GRAPHIC_PROJECTS } from '../data/portfolioData';
import { GraphicCategory, GraphicProject } from '../types';

interface GraphicDesignSectionProps {
  projects?: GraphicProject[];
}

const DESIGN_CATEGORIES: { id: GraphicCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'key-art', label: 'Posters' },
  { id: 'thumbnails', label: 'Thumbnails' },
  { id: 'styleframes', label: 'Identity' },
];

export const GraphicDesignSection: React.FC<GraphicDesignSectionProps> = ({
  projects = GRAPHIC_PROJECTS,
}) => {
  const [activeCategory, setActiveCategory] = useState<GraphicCategory>('all');
  const [selectedImage, setSelectedImage] = useState<GraphicProject | null>(null);

  // Lock body scroll and listen for Escape key when lightbox is active
  useEffect(() => {
    if (!selectedImage) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  const filteredProjects =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="graphic-design" className="py-20 sm:py-28 relative border-t border-zinc-200/80 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Clean, direct 1-word heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
              Design
            </h2>
          </div>

          <p className="text-zinc-600 text-sm sm:text-base max-w-md leading-relaxed font-normal">
            Still frame composition, theatrical key-art, and high-CTR thumbnail packaging.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-10 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2 flex-wrap">
            {DESIGN_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`design-cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-zinc-500">
            {filteredProjects.length} Curated Visual Pieces
          </div>
        </div>

        {/* Masonry / Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              id={`graphic-card-${project.id}`}
              onClick={() => setSelectedImage(project)}
              className="group cursor-pointer rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden bg-zinc-100 aspect-[4/3] sm:aspect-auto sm:h-72">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover grayscale contrast-110 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-zinc-900 shadow-sm">
                    {project.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3 bg-white">
                <div>
                  <div className="text-xs font-mono text-zinc-400 mb-1 font-medium">
                    <span>{project.client}</span>
                  </div>
                  <h4 className="font-display font-bold text-base text-zinc-900 group-hover:text-zinc-700 transition-colors">
                    {project.title}
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200/80 font-medium"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-zinc-800 group-hover:text-black transition-colors">
                    View Details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Inspection Modal */}
      {selectedImage && (
        <div
          id="graphic-lightbox-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with sticky close button always in view */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="w-2 h-2 rounded-full bg-zinc-900 shrink-0" />
                <h3 className="font-display font-bold text-sm sm:text-base text-zinc-900 truncate">
                  {selectedImage.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedImage.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-mono text-zinc-700 hover:text-zinc-900 transition-colors"
                  title="Open high-res original image"
                >
                  <span>Open Full</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  id="close-lightbox-btn"
                  onClick={() => setSelectedImage(null)}
                  className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                  aria-label="Close image modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image View: seamless neutral off-white background with subtle inner border, no harsh black borders */}
            <div className="flex-1 overflow-auto bg-zinc-100/70 p-2 sm:p-4 md:p-6 flex items-center justify-center min-h-[260px] max-h-[75vh]">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full max-h-[70vh] max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>

            {/* Modal Specs & Description */}
            <div className="p-4 sm:p-6 bg-white border-t border-zinc-200 space-y-3 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium">
                    Client: {selectedImage.client}
                  </span>
                  <p className="text-sm font-display font-bold text-zinc-900 mt-0.5">
                    {selectedImage.categoryLabel}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedImage.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700 font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
