import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownRight, Menu, X, Film } from 'lucide-react';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="top-sticky-header"
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-zinc-200/90 py-3 shadow-xs text-zinc-900'
          : 'bg-[#0d0e12]/90 backdrop-blur-md border-b border-white/10 py-3.5 sm:py-4 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Corner: Placeholder Logo Icon & Name "Zolepto" (with press-and-hold secret backdoor) */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-btn"
            onClick={() => handleLinkClick('hero')}
            className="group relative flex items-center gap-2.5 text-left focus:outline-none cursor-pointer select-none"
          >
            {/* Placeholder logo icon */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 shadow-xs ${
                isScrolled ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-950'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
            </div>
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

          {/* Work With Us CTA button */}
          <button
            id="nav-work-with-us-btn"
            onClick={() => handleLinkClick('start')}
            className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 hover:scale-[1.02] shadow-sm active:scale-[0.98] cursor-pointer ${
              isScrolled
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-white text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <span>Work With Us</span>
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
        <div className="sm:hidden border-t border-zinc-200 bg-white px-4 py-3.5 space-y-1 shadow-lg animate-in slide-in-from-top-1 duration-150">
          <button
            id="mobile-nav-portfolio"
            onClick={() => handleLinkClick('work')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
          >
            Portfolio
          </button>
          <button
            id="mobile-nav-blueprint"
            onClick={() => handleLinkClick('process')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
          >
            Workflow
          </button>
          <button
            id="mobile-nav-about"
            onClick={() => handleLinkClick('about')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
          >
            About & Story
          </button>
          <button
            id="mobile-nav-footer"
            onClick={() => handleLinkClick('footer')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
          >
            Contact & Info
          </button>

          {/* Main Action Button inside Menu: Replaces both "Start" and "Let's Create Together" */}
          <div className="pt-2 border-t border-zinc-100 mt-2">
            <button
              id="mobile-nav-main-action"
              onClick={() => handleLinkClick('start')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 text-sm font-semibold tracking-wide transition-all shadow-md group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Work With Us</span>
              </div>
              <ArrowDownRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
