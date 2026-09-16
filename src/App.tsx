/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WorkSection } from './components/WorkSection';
import { AboutSection } from './components/AboutSection';
import { ConsultationFormSection } from './components/ConsultationFormSection';
import { FooterBar } from './components/FooterBar';
import { VideoModal } from './components/VideoModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { VideoProject, GraphicProject, SiteSettings } from './types';
import { MAIN_SHOWREEL, VIDEO_PROJECTS, GRAPHIC_PROJECTS } from './data/portfolioData';
import { subscribeToShowreels, subscribeToGraphics } from './services/portfolioService';
import { subscribeToSiteSettings, DEFAULT_SITE_SETTINGS } from './services/siteSettingsService';

function checkIsAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  return hash === '#admin' || hash === '#/admin' || path === '/admin' || path.startsWith('/admin/');
}

function MainApp() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'portfolio' | 'admin'>(() => {
    return checkIsAdminRoute() ? 'admin' : 'portfolio';
  });
  const [showreels, setShowreels] = useState<VideoProject[]>(VIDEO_PROJECTS);
  const [graphics, setGraphics] = useState<GraphicProject[]>(GRAPHIC_PROJECTS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [activeTheaterProject, setActiveTheaterProject] = useState<VideoProject | null>(null);

  // Sync route with window pathname & hash
  useEffect(() => {
    const handleRouteChange = () => {
      if (checkIsAdminRoute()) {
        setCurrentView('admin');
      } else {
        setCurrentView('portfolio');
      }
    };
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Secret Admin Access Hotkey: CTRL + ALT + SHIFT + L (PC / Desktop)
  useEffect(() => {
    const handleSecretHotkey = (e: KeyboardEvent) => {
      // Must have Ctrl (or Cmd), Alt, and Shift held down together with 'L' or 'l'
      const hasCtrl = e.ctrlKey || e.metaKey;
      if (hasCtrl && e.altKey && e.shiftKey && (e.key === 'L' || e.key === 'l' || e.code === 'KeyL')) {
        e.preventDefault();
        setCurrentView((prev) => {
          if (prev === 'admin') {
            if (window.location.hash.toLowerCase().includes('admin')) {
              window.location.hash = '';
            }
            return 'portfolio';
          } else {
            window.location.hash = 'admin';
            return 'admin';
          }
        });
      }
    };

    window.addEventListener('keydown', handleSecretHotkey);
    return () => {
      window.removeEventListener('keydown', handleSecretHotkey);
    };
  }, []);

  // Real-time Firestore subscriptions for Showreels, Graphic Designs, and Site Settings
  useEffect(() => {
    const unsubShowreels = subscribeToShowreels((items) => {
      setShowreels(items);
    });
    const unsubGraphics = subscribeToGraphics((items) => {
      setGraphics(items);
    });
    const unsubSettings = subscribeToSiteSettings((settings) => {
      setSiteSettings(settings);
    });

    return () => {
      unsubShowreels();
      unsubGraphics();
      unsubSettings();
    };
  }, []);

  const [activeWorkTab, setActiveWorkTab] = useState<'all' | 'showreels' | 'design'>('all');

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    setCurrentView('admin');
  };

  const navigateToPortfolio = () => {
    if (window.location.hash.toLowerCase().includes('admin')) {
      window.location.hash = '';
    }
    if (window.location.pathname.toLowerCase().startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    }
    setCurrentView('portfolio');
  };

  const scrollToSection = (sectionId: string) => {
    if (currentView === 'admin') {
      navigateToPortfolio();
      setTimeout(() => {
        handleScrollTo(sectionId);
      }, 100);
      return;
    }
    handleScrollTo(sectionId);
  };

  const handleScrollTo = (sectionId: string) => {
    if (sectionId === 'showreels') {
      setActiveWorkTab('showreels');
      scrollToWork();
      return;
    }
    if (sectionId === 'graphic-design' || sectionId === 'design') {
      setActiveWorkTab('design');
      scrollToWork();
      return;
    }
    if (sectionId === 'work') {
      setActiveWorkTab('all');
      scrollToWork();
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -75;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToWork = () => {
    const el = document.getElementById('work-section') || document.getElementById('showreels');
    if (el) {
      const yOffset = -75;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handlePlayMasterShowreel = () => {
    setActiveTheaterProject(MAIN_SHOWREEL);
  };

  // Private Admin Route Handler
  if (currentView === 'admin') {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs text-zinc-500">
          Loading authentication...
        </div>
      );
    }

    if (!user) {
      return <AdminLogin onBackToPortfolio={navigateToPortfolio} />;
    }

    return (
      <AdminPanel
        onBackToPortfolio={navigateToPortfolio}
        showreels={showreels}
        graphics={graphics}
      />
    );
  }

  // Public Long-Scrollable Portfolio View
  return (
    <div className="relative min-h-screen bg-[#fafafa] text-[#18181b] flex flex-col selection:bg-zinc-200 selection:text-zinc-900 font-body antialiased overflow-x-hidden">
      {/* Top Pre-render Timeline Buffer Sweep Line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: [1, 1, 0] }}
        transition={{ duration: 1.1, times: [0, 0.75, 1], ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: '0%' }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-zinc-950 via-zinc-700 to-zinc-400 z-[999] pointer-events-none"
      />

      {/* Cinematic Site IN-Animation: Soft Blur-In and Subtle Glide */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(16px)', y: 8 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col"
      >
        {/* Sticky Top Header */}
        <Header
          onNavigate={scrollToSection}
          onOpenAdmin={navigateToAdmin}
        />

        {/* Main Long-Scrollable Content */}
        <main className="flex-1">
          {/* Hero Section */}
          <HeroSection
            onNavigate={scrollToSection}
            onPlayFeatured={handlePlayMasterShowreel}
            settings={siteSettings}
          />

          {/* Unified Work Section (Showreels & Graphic Designs with mobile/tablet slider) */}
          <WorkSection
            showreels={showreels}
            graphics={graphics}
            activeTab={activeWorkTab}
            onTabChange={setActiveWorkTab}
            onOpenVideoModal={(p) => setActiveTheaterProject(p)}
          />

          {/* About & Personal Background / Story Section (with Blueprint Workshop & Identifying You) */}
          <AboutSection
            onStartBooking={() => scrollToSection('start')}
            settings={siteSettings}
          />

          {/* Project Request & Consultation Booking Form Section */}
          <ConsultationFormSection settings={siteSettings} />
        </main>

        {/* Footer with copyright, rotating role, email, and admin link */}
        <FooterBar onOpenAdmin={navigateToAdmin} />
      </motion.div>

      {/* Video Modal Theater - Mounted at top-level outside motion.div */}
      <VideoModal
        project={activeTheaterProject}
        onClose={() => setActiveTheaterProject(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
