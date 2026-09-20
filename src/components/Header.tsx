import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownRight, Menu, X, Film } from 'lucide-react';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
  logoUrl?: string;
  logoDarkUrl?: string;
  logoLightUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  logoUrl,
  logoDarkUrl,
  logoLightUrl,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  // Active logo depends on whether header is in dark (top) or light (scrolled) state
  const activeLogo = isScrolled
    ? (logoLightUrl?.trim() || logoDarkUrl?.trim() || logoUrl?.trim() || '')
    : (logoDarkUrl?.trim() || logoUrl?.trim() || logoLightUrl?.trim() || '');

  useEffect(() => {
    setLogoFailed(false);
  }, [activeLogo]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate('hero');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const hasCustomLogo = Boolean(activeLogo && !logoFailed);

  return (
    <header
      id="top-sticky-header"
      className={`fixed top-0 left-0 right-0 z-[60] transform-gpu will-change-[background-color,backdrop-filter,border-color] transition-colors duration-300 backdrop-blur-xl ${
        isScrolled
          ? 'bg-white/75 border-b border-zinc-200/60 py-3 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.06)] text-zinc-900'
          : 'bg-[#0d0e12]/75 border-b border-white/[0.09] py-3.5 sm:py-4 text-white shadow-[0_4px_24px_-2px_rgba(0,0,0,0.3)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Corner: Brand Logo / Home Button & Name "Zolepto" */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-btn"
            onClick={handleHomeClick}
            aria-label="Zolepto Home"
            className="group relative flex items-center gap-2.5 text-left focus:outline-none cursor-pointer select-none"
          >
            {/* Customizable floating brand logo or default mark */}
            {hasCustomLogo ? (
              <div className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0 select-none">
                <img
                  src={activeLogo}
                  alt="Zolepto Logo"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                  className="h-8 sm:h-9 md:h-10 w-auto max-w-[140px] max-h-10 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] select-none pointer-events-none"
                />
              </div>
            ) : (
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 shadow-xs ${
                  isScrolled ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-950'
                }`}
              >
                <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}
            <span
              className={`relative font-display font-bold text-base sm:text-lg tracking-normal transition-colors ${
                isScrolled ? 'text-zinc-900 group-hover:text-zinc-700' : 'text-white group-hover:text-zinc-300'
              }`}
            >
              Zolepto
            </span>
          </button>
        </div>

        {/* Right Corner: Navigation links without any visible admin icons */}
        <nav className="hidden sm:flex items-center gap-7">
          <button
            id="nav-portfolio"
            onClick={() => handleLinkClick('work')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              isScrolled ? 'text-zinc-600 hover:text-zinc-950' : 'text-zinc-300 hover:text-white'
            }`}
          >
            Portfolio
          </button>

          <button
            id="nav-blueprint"
            onClick={() => handleLinkClick('process')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              isScrolled ? 'text-zinc-600 hover:text-zinc-950' : 'text-zinc-300 hover:text-white'
            }`}
          >
            Workflow
          </button>

          {/* Explicit requirement: text for "about" which scrolls users into personal background/story */}
          <button
            id="nav-about"
            onClick={() => handleLinkClick('about')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              isScrolled ? 'text-zinc-600 hover:text-zinc-950' : 'text-zinc-300 hover:text-white'
            }`}
          >
            About
          </button>

          {/* Bottom section navigation */}
          <button
            id="nav-footer"
            onClick={() => handleLinkClick('footer')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              isScrolled ? 'text-zinc-600 hover:text-zinc-950' : 'text-zinc-300 hover:text-white'
            }`}
          >
            Contact & Info
          </button>

          {/* Start a Project CTA button */}
          <button
            id="nav-work-with-us-btn"
            onClick={() => handleLinkClick('start')}
            className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 hover:scale-[1.02] shadow-sm active:scale-[0.98] cursor-pointer ${
              isScrolled
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-white text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <span>Start a Project</span>
            <ArrowDownRight className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
          </button>
        </nav>

        {/* Mobile Hamburger Toggle (No extra 'start' button cluttering the header) */}
        <div className="flex sm:hidden items-center">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg border transition-colors ${
              isScrolled
                ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                : 'bg-white/10 text-white border-white/20'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Quick Travel Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className={`sm:hidden border-t px-4 py-3.5 space-y-1 shadow-xl backdrop-blur-xl animate-in slide-in-from-top-1 duration-150 ${
            isScrolled
              ? 'bg-white/85 border-zinc-200/80 text-zinc-900'
              : 'bg-[#0d0e12]/92 border-white/10 text-white'
          }`}
        >
          <div className="space-y-0.5">
            <button
              id="mobile-nav-portfolio"
              onClick={() => handleLinkClick('work')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isScrolled ? 'text-zinc-900 hover:bg-zinc-100' : 'text-white hover:bg-white/10'
              }`}
            >
              Portfolio
            </button>
            <div className="pl-3 grid grid-cols-2 gap-1 pb-1">
              <button
                id="mobile-nav-shorts"
                onClick={() => handleLinkClick('shorts')}
                className={`text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isScrolled ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950' : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                ↳ Vertical / Shorts
              </button>
              <button
                id="mobile-nav-design"
                onClick={() => handleLinkClick('design')}
                className={`text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isScrolled ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950' : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                ↳ Graphic Design
              </button>
            </div>
          </div>
          <button
            id="mobile-nav-blueprint"
            onClick={() => handleLinkClick('process')}
            className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isScrolled ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Workflow
          </button>
          <button
            id="mobile-nav-about"
            onClick={() => handleLinkClick('about')}
            className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isScrolled ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            About & Story
          </button>
          <button
            id="mobile-nav-footer"
            onClick={() => handleLinkClick('footer')}
            className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isScrolled ? 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Contact & Info
          </button>

          {/* Main Action Button inside Menu: Replaces both "Start" and "Let's Create Together" */}
          <div className={`pt-2 border-t mt-2 ${isScrolled ? 'border-zinc-200/60' : 'border-white/10'}`}>
            <button
              id="mobile-nav-main-action"
              onClick={() => handleLinkClick('start')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md group cursor-pointer ${
                isScrolled ? 'bg-zinc-950 text-white hover:bg-zinc-800' : 'bg-white text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Start a Project</span>
              </div>
              <ArrowDownRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
