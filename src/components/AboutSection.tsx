import React, { useRef } from 'react';
import {
  ArrowUpRight,
  Sparkles,
  Scissors,
  Volume2,
  CheckCircle,
  Eye,
  Sliders,
  Layers,
} from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { SiteSettings } from '../types';

interface AboutSectionProps {
  onStartBooking: () => void;
  settings?: SiteSettings;
}

interface ProcessStepItem {
  id: number;
  number: string;
  title: string;
  tag: string;
  timecode: string;
  subtitle: string;
  icon: string;
  description: string;
  handwrittenNote: string;
}

/**
 * ScrollPhaseItem: Reacts to viewport scroll progression with subtle color gradient blobs
 * placed organically per phase, emphasized title typography (with handwritten gradient 'YOU'),
 * free-floating icons, and an animated circular marker with background shielding.
 */
const ScrollPhaseItem: React.FC<{
  step: ProcessStepItem;
  idx: number;
  isLast: boolean;
}> = ({ step, isLast }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, {
    amount: 0.35,
    margin: '-10% 0px -25% 0px',
  });

  const renderTitle = () => {
    if (step.id === 1) {
      return (
        <h4 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <span>Identifying</span>
          <span className="font-handwriting font-bold tracking-wider text-2xl sm:text-3xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent transform -rotate-2 inline-block px-1 drop-shadow-xs">
            YOU
          </span>
        </h4>
      );
    }

    if (step.id === 2) {
      return (
        <h4 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5">
          <span>Deconstructing the</span>
          <span className="font-display font-black tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
            Narrative
          </span>
        </h4>
      );
    }

    if (step.id === 3) {
      return (
        <h4 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5">
          <span>Emotional Rhythm &</span>
          <span className="font-display font-black tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Subconscious Sound
          </span>
        </h4>
      );
    }

    if (step.id === 4) {
      return (
        <h4 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5">
          <span>Visual Prestige &</span>
          <span className="font-display font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
            Delivery
          </span>
        </h4>
      );
    }

    return (
      <h4
        className={`font-display text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-500 ${
          isInView ? 'text-zinc-950' : 'text-zinc-700'
        }`}
      >
        {step.title}
      </h4>
    );
  };

  return (
    <div
      ref={itemRef}
      id={`process-phase-${step.id}`}
      className="relative group transition-all duration-500 isolate"
    >
      {/* Subtle organic color gradient accents placed with offset and hugging outer flanks */}
      {step.id === 1 && (
        <div className="absolute -top-8 -left-12 sm:-left-20 w-80 h-44 rounded-full bg-gradient-to-tr from-violet-500/14 via-fuchsia-400/10 to-transparent blur-2xl pointer-events-none -z-10" />
      )}

      {step.id === 2 && (
        <div className="absolute -top-6 -right-12 sm:-right-20 w-80 h-44 rounded-full bg-gradient-to-tl from-amber-500/14 via-orange-400/10 to-transparent blur-2xl pointer-events-none -z-10" />
      )}

      {step.id === 3 && (
        <div className="absolute -top-8 -left-12 sm:-left-20 w-80 h-44 rounded-full bg-gradient-to-tr from-sky-400/14 via-blue-500/10 to-transparent blur-2xl pointer-events-none -z-10" />
      )}

      {step.id === 4 && (
        <div className="absolute -top-6 -right-12 sm:-right-20 w-80 h-44 rounded-full bg-gradient-to-tl from-emerald-400/14 via-teal-400/10 to-transparent blur-2xl pointer-events-none -z-10" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start relative z-10">
        {/* Left Step Marker with Hand-Drawn Circle reacting to scroll & shielded background */}
        <div className="lg:col-span-5 flex items-start gap-4 relative">
          <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center bg-[#fafafa] rounded-full z-10 shadow-2xs">
            <svg
              viewBox="0 0 100 100"
              className={`absolute inset-0 w-full h-full transition-all duration-500 transform-gpu ${
                isInView
                  ? 'scale-110 rotate-8 text-zinc-950 stroke-[3.5]'
                  : 'scale-95 rotate-0 text-zinc-300 stroke-[2.2]'
              }`}
            >
              <path
                d="M 50,8 C 76,6 94,22 93,51 C 92,78 74,94 48,93 C 21,92 7,74 8,47 C 9,21 28,10 52,8"
                fill="none"
                stroke="currentColor"
                strokeWidth={isInView ? '3.5' : '2.2'}
                strokeLinecap="round"
              />
            </svg>
            <span
              className={`font-display font-bold text-xl relative z-10 transition-all duration-500 ${
                isInView ? 'text-zinc-950 scale-105' : 'text-zinc-400 scale-100'
              }`}
            >
              {step.number}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2.5">
              {/* Free-floating icon with NO container shapeholder */}
              <span className="text-base sm:text-lg text-zinc-400 select-none pointer-events-none transition-transform duration-300 group-hover:scale-110 shrink-0">
                {step.icon}
              </span>
              {renderTitle()}
            </div>
            <span className="text-xs font-mono text-zinc-400 block pl-7">
              {step.subtitle}
            </span>
          </div>
        </div>

        {/* Right Narrative & Clean Workshop Annotations */}
        <div className="lg:col-span-7 space-y-4 relative">
          <p className="text-zinc-700 text-base sm:text-lg leading-relaxed font-body">
            {step.description}
          </p>

          {/* Hand-drawn Commentary Annotation with rough doodle */}
          <div className="pt-2 flex items-center gap-3">
            <svg
              className={`w-7 h-7 flex-shrink-0 transition-colors duration-500 ${
                isInView ? 'text-zinc-800' : 'text-zinc-300'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>

            <p
              className={`font-handwriting text-xl sm:text-2xl font-medium tracking-wide transition-colors duration-500 ${
                isInView ? 'text-zinc-900' : 'text-zinc-600'
              }`}
            >
              {step.handwrittenNote}
            </p>
          </div>
        </div>
      </div>

      {!isLast && <div className="h-6 sm:h-12" />}
    </div>
  );
};

export const AboutSection: React.FC<AboutSectionProps> = ({ onStartBooking, settings }) => {
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepsScrollProgress } = useScroll({
    target: stepsContainerRef,
    offset: ['start center', 'end center'],
  });

  const quote =
    settings?.aboutQuote ||
    '“An edit isn’t just assembling footage. It’s an emotional rhythm that decides whether a viewer clicks away in three seconds or stays until the final frame.”';
  const bio1 =
    settings?.aboutBio1 ||
    'I’m Zolepto Hiraya. For over four years, I’ve lived inside the timeline—obsessing over the millisecond a cut lands, why retention drops at forty-five seconds, and how subconscious sound design transforms an ordinary video into an unforgettable experience.';
  const bio2 =
    settings?.aboutBio2 ||
    'I partner directly with creators, founders, and ambitious brands. No junior handoffs, no agency bloat. You work directly with me from raw footage ingest to final sound mix and cinematic color grade.';

  // Refined, subtle monochromatic palette with zero saturated rainbow colors
  const PROCESS_STEPS: ProcessStepItem[] = [
    {
      id: 1,
      number: '01',
      title: settings?.step1Title || 'Identifying You',
      tag: '[ PHASE 01 // SIGNAL EXTRACTION ]',
      timecode: 'TC 00:00:00:00',
      subtitle: settings?.step1Subtitle || 'The Core Signal & Creative DNA',
      icon: '✦',
      description:
        settings?.step1Description ||
        'Before a single clip is dragged to the timeline or a cut is made, we identify you. Who you are, what your voice stands for, who your real audience is, and the psychological hook that makes your content undeniably yours. We don’t copy trends or use cookie-cutter templates—we locate your authentic edge and reverse-engineer the entire narrative around it.',
      handwrittenNote:
        settings?.step1Note ||
        '“Who you are > fancy transitions. This is where real retention is born.”',
    },
    {
      id: 2,
      number: '02',
      title: settings?.step2Title || 'Deconstructing the Narrative',
      tag: '[ PHASE 02 // THE BREAKDOWN ]',
      timecode: 'TC 00:01:24:12',
      subtitle: settings?.step2Subtitle || 'Ruthless Dissection & Trimming the Fat',
      icon: '✂',
      description:
        settings?.step2Description ||
        'Every raw timeline is bloated with comfort footage and dead air. We break your narrative down to its absolute bare skeleton. Dissecting the raw rushes, unearthing unexpected gold in second takes, and mapping out the viewer retention curve. Every single second on the timeline must justify its existence or get cut. It’s an intentional, honest breakdown until only pure substance remains.',
      handwrittenNote:
        settings?.step2Note ||
        '✂ Cut the safety filler. If it doesn’t push the story forward, it dies here.',
    },
    {
      id: 3,
      number: '03',
      title: settings?.step3Title || 'Emotional Rhythm & Subconscious Sound',
      tag: '[ PHASE 03 // ACOUSTIC ARCHITECTURE ]',
      timecode: 'TC 00:02:48:06',
      subtitle: settings?.step3Subtitle || 'The Kinetic Pulse & Visceral Foley',
      icon: '♫',
      description:
        settings?.step3Description ||
        'Pacing isn’t raw speed—it’s tension, breath, and release. We sculpt the cut to an auditory heartbeat: layering subconscious micro-risers, tactile foley, deep sub-bass drops, and room ambience that viewers feel in their chest before their eyes even register it. Audio carries 70% of cinematic perception; we treat sound as equal to the picture.',
      handwrittenNote:
        settings?.step3Note ||
        'Subconscious audio cues [40Hz - 12kHz] — spatial depth & tactile rhythm',
    },
    {
      id: 4,
      number: '04',
      title: settings?.step4Title || 'Visual Prestige & Delivery',
      tag: '[ PHASE 04 // MASTER POLISH & LAUNCH ]',
      timecode: 'TC 00:04:12:00',
      subtitle: settings?.step4Subtitle || 'Color Science, Key-Art & Cultural Authority',
      icon: '✓',
      description:
        settings?.step4Description ||
        'The final synthesis. Film-grade DaVinci color science with custom highlight rolloff, skin-tone preservation, kinetic typography, and high-CTR thumbnail packaging that stops the infinite scroll. When we export, your project looks and sounds like a studio production that commands immediate respect and builds long-term authority.',
      handwrittenNote:
        settings?.step4Note ||
        '✦ Ready for export. Approved for master release across all formats.',
    },
  ];

  return (
    <section
      id="blueprint-about"
      className="py-16 sm:py-24 relative bg-[#fafafa] overflow-hidden"
    >
      {/* Viewport Side-Hugging Ambient Gradient Blobs (Spread far out, hugging screen sides) */}
      <div className="absolute top-[8%] -left-24 sm:-left-36 md:-left-48 w-72 sm:w-[420px] h-80 sm:h-[480px] rounded-full bg-gradient-to-tr from-violet-500/18 via-fuchsia-400/12 to-rose-400/10 blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[28%] -right-24 sm:-right-36 md:-right-48 w-72 sm:w-[420px] h-80 sm:h-[480px] rounded-full bg-gradient-to-bl from-amber-500/18 via-orange-400/12 to-rose-400/10 blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[48%] -left-24 sm:-left-36 md:-left-48 w-72 sm:w-[420px] h-80 sm:h-[480px] rounded-full bg-gradient-to-r from-sky-400/18 via-blue-500/12 to-indigo-500/10 blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[68%] -right-24 sm:-right-36 md:-right-48 w-72 sm:w-[420px] h-80 sm:h-[480px] rounded-full bg-gradient-to-tl from-emerald-400/18 via-teal-400/12 to-amber-400/10 blur-3xl pointer-events-none -z-0" />

      {/* Anchor targets */}
      <div id="process" className="absolute -top-24 pointer-events-none" />
      <div id="blueprint" className="absolute -top-24 pointer-events-none" />

      {/* Blueprint Ambient Grid Watermark */}
      <div className="absolute inset-0 pointer-events-none blueprint-sheet opacity-60" />

      {/* Workshop Registration Crosshairs */}
      <div className="absolute top-8 left-8 text-zinc-300 font-mono text-[11px] select-none pointer-events-none hidden sm:block">
        + [ WORKSHOP SHEET // REF-2026 ]
      </div>
      <div className="absolute top-8 right-8 text-zinc-300 font-mono text-[11px] select-none pointer-events-none hidden sm:block">
        SCALE 1:1 // 24.00 FPS +
      </div>
      <div className="absolute bottom-8 left-8 text-zinc-300 font-mono text-[11px] select-none pointer-events-none hidden sm:block">
        + ZOLEPTO DIRECTORIAL DRAFT
      </div>
      <div className="absolute bottom-8 right-8 text-zinc-300 font-mono text-[11px] select-none pointer-events-none hidden sm:block">
        REV 04 // NO COOKIE-CUTTER TEMPLATES +
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ============================================================ */}
        {/* 1. THE BLUEPRINT WORKSHOP PROCESS: FREE FLOW & PROGRESSION   */}
        {/* PLACED FIRST AS REQUESTED ABOVE ABOUT ME                     */}
        {/* ============================================================ */}
        <div>
          {/* Blueprint Header - Centered & Emphasized */}
          <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-24 relative">
            <div className="inline-flex items-center justify-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 font-mono text-[11px] uppercase tracking-widest font-semibold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
              OUR PROCESS
            </div>

            <h3 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.1] mb-2">
              {settings?.workshopHeading || 'How the story unfolds.'}
            </h3>

            {/* Hand-drawn subtle scribble underline beneath headline */}
            <div className="w-44 sm:w-60 h-2.5 mx-auto mb-4 text-zinc-300">
              <svg viewBox="0 0 240 12" fill="none" className="w-full h-full">
                <path
                  d="M4 8.5C60 3.5 130 4 236 7C175 10 90 10.5 4 9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="mt-3 text-base sm:text-lg text-zinc-600 font-body max-w-2xl mx-auto leading-relaxed">
              {settings?.workshopSubtitle ||
                'No rigid agency steps or generic templates. A deliberate, human creative process mapped out like a workshop drafting sheet—breaking things down to discover what truly resonates.'}
            </p>

            {/* Blueprint ruler simulation */}
            <div className="mt-6 flex items-center justify-center gap-1 overflow-hidden opacity-30 select-none pointer-events-none text-[9px] font-mono text-zinc-400 max-w-md mx-auto">
              <span>0IN</span>
              <span className="flex-1 border-b border-dashed border-zinc-400" />
              <span>|···|···|···|···|</span>
              <span className="flex-1 border-b border-dashed border-zinc-400" />
              <span>12IN</span>
              <span className="flex-1 border-b border-dashed border-zinc-400" />
              <span>24IN</span>
            </div>
          </div>

          {/* FREE-FLOW PROGRESSION CONTAINER: No hard card borders */}
          <div ref={stepsContainerRef} className="relative space-y-16 sm:space-y-24">
            {/* Continuous dashed progression track with subtle handwritten swirls connecting behind the steps */}
            <div className="hidden lg:block absolute left-[32px] -translate-x-1/2 top-8 bottom-16 w-12 pointer-events-none z-0">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 48 1000"
                preserveAspectRatio="none"
              >
                {/* Background dashed guide line with gentle organic curves and subtle swirls */}
                <path
                  d="M 24 0 C 24 90, 20 150, 24 210 C 28 245, 36 275, 24 310 C 14 340, 16 365, 24 390 C 32 435, 18 500, 24 560 C 28 600, 34 635, 24 680 C 14 720, 18 750, 24 785 C 30 835, 20 890, 24 1000"
                  fill="none"
                  stroke="#e4e4e7"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                />

                {/* Animated progress dashed line driven by scroll progression */}
                <motion.path
                  d="M 24 0 C 24 90, 20 150, 24 210 C 28 245, 36 275, 24 310 C 14 340, 16 365, 24 390 C 32 435, 18 500, 24 560 C 28 600, 34 635, 24 680 C 14 720, 18 750, 24 785 C 30 835, 20 890, 24 1000"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="2.5"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  style={{ pathLength: stepsScrollProgress }}
                />
              </svg>
            </div>

            {PROCESS_STEPS.map((step, idx) => (
              <ScrollPhaseItem
                key={step.id}
                step={step}
                idx={idx}
                isLast={idx === PROCESS_STEPS.length - 1}
              />
            ))}
          </div>

          {/* Blueprint Workshop Summary Stamp Footer */}
          <div className="mt-20 pt-12 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-900 flex items-center justify-center p-1 text-center rotate-[-6deg]">
                <span className="font-mono text-[9px] font-bold text-zinc-900 leading-tight">
                  HUMAN
                  <br />
                  CRAFTED
                </span>
              </div>
              <div>
                <p className="font-display font-bold text-base text-zinc-950">
                  Zero assembly lines.
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  Every project is treated as an individual piece of cinema.
                </p>
              </div>
            </div>

            <button
              id="blueprint-start-btn"
              onClick={onStartBooking}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer"
            >
              <span>Begin With Step 01</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:rotate-45" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. ABOUT ME: PERSONAL STORY, PHILOSOPHY & CRAFT SPECS        */}
        {/* PLACED AFTER THE WORKSHOP BLUEPRINT                          */}
        {/* ============================================================ */}
        <div id="about" className="mt-28 pt-20 border-t border-zinc-200/90 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Main Title & Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-zinc-200 shadow-2xs font-mono text-xs text-zinc-600">
                <span className="w-2 h-2 rounded-full bg-zinc-900" />
                <span>ABOUT ME & THE STUDIO</span>
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12]">
                Crafting edits that audiences refuse to skip.
              </h2>

              {/* Hand-drawn sticky note decoration */}
              <div className="relative inline-block mt-2">
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-950 max-w-sm rotate-[-1deg] shadow-2xs">
                  <div className="absolute -top-3 left-8 px-3 py-0.5 bg-amber-100/90 border border-amber-300/50 text-[10px] font-mono text-amber-800 rounded-xs uppercase tracking-wider -rotate-2">
                    DIRECTOR NOTE
                  </div>
                  <p className="font-handwriting text-xl sm:text-2xl leading-snug text-zinc-800 pt-1">
                    “When people watch a great video, they don't notice the cuts—they feel the momentum.”
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  id="about-cta-start"
                  onClick={onStartBooking}
                  className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Work 1-on-1 With Me</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </motion.div>

            {/* Philosophy & Bio */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-7 space-y-6 text-zinc-700 text-base sm:text-lg leading-relaxed font-normal"
            >
              <blockquote className="font-display text-xl sm:text-2xl text-zinc-950 font-medium leading-snug border-l-2 border-zinc-950 pl-5">
                {quote}
              </blockquote>

              <p className="text-zinc-600">
                {bio1}
              </p>

              <p className="text-zinc-600">
                {bio2}
              </p>

              {/* Timeline Craft Specs Bar */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-zinc-500 border-t border-zinc-200">
                <div>
                  <span className="block text-zinc-400 text-[10px]">TIMELINE NLE</span>
                  <span className="font-medium text-zinc-800">Premiere & DaVinci</span>
                </div>
                <div>
                  <span className="block text-zinc-400 text-[10px]">COLOR SCIENCE</span>
                  <span className="font-medium text-zinc-800">YRGB 35mm Emulation</span>
                </div>
                <div>
                  <span className="block text-zinc-400 text-[10px]">SOUND FOLEY</span>
                  <span className="font-medium text-zinc-800">Logic Pro & Stems</span>
                </div>
                <div>
                  <span className="block text-zinc-400 text-[10px]">PACKAGING</span>
                  <span className="font-medium text-zinc-800">High-CTR Key-Art</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
