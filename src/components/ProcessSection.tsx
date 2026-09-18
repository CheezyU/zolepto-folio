import React, { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useInView, useScroll } from 'motion/react';
import { SiteSettings } from '../types';

interface ProcessSectionProps {
  onStartBooking: () => void;
  settings?: SiteSettings;
}

interface ProcessStepItem {
  id: number;
  number: string;
  title: string;
  description: string;
}

// Simple, large floating background shapes (clean architectural line art, zero color splash)
const ClientSilhouetteShape = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    className="w-full h-full text-zinc-900/[0.08]"
  >
    <circle
      cx="50"
      cy="32"
      r="16"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M22 84 C 22 62, 34 54, 50 54 C 66 54, 78 62, 78 84"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

const LightbulbShape = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    className="w-full h-full text-zinc-900/[0.08]"
  >
    <path
      d="M50 18 C 36 18, 28 28, 28 40 C 28 49, 34 56, 38 62 L 38 68 C 38 70, 40 72, 42 72 L 58 72 C 60 72, 62 70, 62 68 L 62 62 C 66 56, 72 49, 72 40 C 72 28, 64 18, 50 18 Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="42"
      y1="78"
      x2="58"
      y2="78"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <line
      x1="46"
      y1="84"
      x2="54"
      y2="84"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M44 46 L 50 36 L 56 46"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EyeShape = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    className="w-full h-full text-zinc-900/[0.08]"
  >
    <path
      d="M14 50 C 26 28, 74 28, 86 50 C 74 72, 26 72, 14 50 Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="50" cy="50" r="4.5" fill="currentColor" />
  </svg>
);

const PaperPlaneShape = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    className="w-full h-full text-zinc-900/[0.08]"
  >
    <path
      d="M16 52 L 86 18 L 52 84 L 42 56 Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="86"
      y1="18"
      x2="42"
      y2="56"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// Authentic hand-drawn organic circular paths for each phase step
const HANDDRAWN_STEP_PATHS: Record<number, string> = {
  1: 'M 49,10 C 74,8 92,23 91,48 C 90,74 74,91 49,90 C 23,89 9,73 10,48 C 11,23 27,11 49,10 Z',
  2: 'M 52,9 C 77,12 92,28 90,52 C 88,77 71,92 47,91 C 21,90 8,72 10,47 C 12,21 26,8 52,9 Z',
  3: 'M 47,11 C 72,10 90,26 91,51 C 92,75 75,91 51,90 C 25,89 10,75 9,51 C 8,26 23,12 47,11 Z',
  4: 'M 50,9 C 75,8 93,24 91,49 C 89,74 74,91 49,90 C 23,89 10,74 11,49 C 12,23 26,10 50,9 Z',
};

const SKETCH_OUTLINES: Record<number, string> = {
  1: 'M 51,6 C 78,5 96,22 94,52 C 92,78 72,95 46,94 C 18,93 6,75 7,49 C 8,22 25,7 51,6 C 73,5 92,18 95,44',
  2: 'M 54,6 C 80,10 95,27 94,55 C 93,81 70,96 44,95 C 17,94 5,73 8,46 C 11,18 27,5 54,6 C 77,8 94,23 92,48',
  3: 'M 45,7 C 73,6 93,24 95,53 C 97,80 73,95 48,94 C 20,93 6,77 6,49 C 6,21 23,8 45,7 C 71,7 93,21 94,46',
  4: 'M 52,6 C 78,5 96,22 94,52 C 92,78 72,95 46,94 C 19,93 6,75 8,48 C 10,21 27,6 52,6 C 76,6 94,18 92,42',
};

/**
 * ScrollPhaseItem: Viewport scroll-reactive phase item with large floating background shapes,
 * organic gradient background accents, clean typography, and hand-drawn circular number markers.
 */
const ScrollPhaseItem: React.FC<{
  step: ProcessStepItem;
  idx: number;
  isLast: boolean;
}> = ({ step, isLast }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, {
    amount: 'some',
    margin: '-20% 0px -46% 0px',
  });

  const renderTitle = () => {
    if (step.id === 1) {
      return (
        <h4 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <span>Identifying</span>
          <span className="font-handwriting font-bold tracking-wider text-3xl sm:text-4xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent transform -rotate-2 inline-block px-1 drop-shadow-xs">
            YOU
          </span>
        </h4>
      );
    }

    if (step.id === 2) {
      return (
        <h4 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <span>Dissecting the</span>
          <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent font-bold">
            Narrative
          </span>
        </h4>
      );
    }

    if (step.id === 3) {
      return (
        <h4 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <span>Look Beyond the</span>
          <span className="bg-gradient-to-r from-sky-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent font-bold">
            Process
          </span>
        </h4>
      );
    }

    return (
      <h4 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
        <span>Official</span>
        <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent font-bold">
          Drop
        </span>
      </h4>
    );
  };

  const renderMarker = () => (
    <div className="relative shrink-0">
      <motion.div
        animate={{
          scale: isInView ? [1, 1.14, 1] : 1,
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-13 h-13 sm:w-16 sm:h-16 flex items-center justify-center relative select-none"
      >
        {/* Hand-drawn authentic ink shape without small badge overlay */}
        <svg
          className="absolute inset-0 w-full h-full overflow-visible drop-shadow-2xs pointer-events-none"
          viewBox="0 0 100 100"
        >
          {/* Secondary faint outer sketch wobble outline */}
          <path
            d={SKETCH_OUTLINES[step.id] || SKETCH_OUTLINES[1]}
            fill="none"
            stroke={isInView ? '#52525b' : '#d4d4d8'}
            strokeWidth="1.6"
            strokeLinecap="round"
            className="transition-colors duration-300"
          />

          {/* Main hand-drawn filled container */}
          <path
            d={HANDDRAWN_STEP_PATHS[step.id] || HANDDRAWN_STEP_PATHS[1]}
            fill={isInView ? '#09090b' : '#ffffff'}
            stroke={isInView ? '#09090b' : '#27272a'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        </svg>

        <span
          className={`font-mono text-base sm:text-lg font-bold tracking-tight relative z-10 transition-colors duration-300 ${
            isInView ? 'text-white' : 'text-zinc-950'
          }`}
        >
          {step.number}
        </span>
      </motion.div>
    </div>
  );

  return (
    <div
      ref={itemRef}
      className={`relative ${!isLast ? 'pb-16 sm:pb-24' : ''}`}
    >
      {/* Col B: Main Narrative Content with Large Static Background Shapes */}
      <div className="relative z-10">
        {/* Large static background shapes (clean architectural line art, zero harsh colors) */}
        {step.id === 1 && (
          <div className="absolute -top-10 -right-4 sm:right-6 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none -z-10 select-none opacity-80 transform -rotate-6">
            <ClientSilhouetteShape />
          </div>
        )}

        {step.id === 2 && (
          <div className="absolute -top-12 -left-4 sm:left-8 w-44 sm:w-60 h-44 sm:h-60 pointer-events-none -z-10 select-none opacity-80 transform rotate-12">
            <LightbulbShape />
          </div>
        )}

        {step.id === 3 && (
          <div className="absolute -top-8 -right-6 sm:right-8 w-48 sm:w-68 h-48 sm:h-68 pointer-events-none -z-10 select-none opacity-80 transform -rotate-8">
            <EyeShape />
          </div>
        )}

        {step.id === 4 && (
          <div className="absolute -top-10 -left-4 sm:left-12 w-44 sm:w-64 h-44 sm:h-64 pointer-events-none -z-10 select-none opacity-80 transform rotate-16">
            <PaperPlaneShape />
          </div>
        )}

        {/* Mobile View: Phase number sits directly beside the phase title (subheadings removed) */}
        <div className="lg:hidden flex items-center gap-3.5 sm:gap-4 mb-3.5">
          {renderMarker()}
          <div className="min-w-0">
            {renderTitle()}
          </div>
        </div>

        {/* Desktop View: 2-column grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Desktop Col A: Phase Marker */}
          <div className="hidden lg:flex lg:col-span-2 items-start relative z-10">
            {renderMarker()}
          </div>

          {/* Col B: Desktop Title & Clean Description (subheadings removed) */}
          <div className="lg:col-span-10 space-y-3 relative z-10">
            <div className="hidden lg:block">
              {renderTitle()}
            </div>

            <p className="text-zinc-700 text-sm sm:text-base font-normal leading-relaxed max-w-3xl">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProcessSection: React.FC<ProcessSectionProps> = ({
  onStartBooking,
  settings,
}) => {
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepsScrollProgress } = useScroll({
    target: stepsContainerRef,
    offset: ['start center', 'end center'],
  });

  const PROCESS_STEPS: ProcessStepItem[] = [
    {
      id: 1,
      number: '01',
      title: settings?.step1Title || 'Identifying YOU',
      description:
        settings?.step1Description && !settings.step1Description.includes('We have to identify your authentic side')
          ? settings.step1Description
          : "I start with you: your authentic side, what your content stands for, and who you're actually trying to reach. Your content and ideas come first, before I touch the footage.",
    },
    {
      id: 2,
      number: '02',
      title: settings?.step2Title || 'Dissecting the Narrative',
      description:
        settings?.step2Description && !settings.step2Description.includes('We prioritize the value of the content')
          ? settings.step2Description
          : "The value of your content matters more than flashy edits. I lift your story in the style you envision, and every cut, effect, and transition has to serve the progression of the video.",
    },
    {
      id: 3,
      number: '03',
      title: settings?.step3Title || 'Look Beyond the Process',
      description:
        settings?.step3Description && !settings.step3Description.includes('Actually step out of the editing state')
          ? settings.step3Description
          : "I step out of editing mode and actually watch it as your own viewer would. Does the edit elevate the story? Was it worth watching? Every second has to be justified.",
    },
    {
      id: 4,
      number: '04',
      title: settings?.step4Title || 'Official Drop',
      description:
        settings?.step4Description && !settings.step4Description.includes('After a meticulous process of multiple passes')
          ? settings.step4Description
          : "Multiple passes, with every cut, layer, and effect double-checked, then delivered on the promised date. Total transparency, zero ghosting, and easy collaboration.",
    },
  ];

  return (
    <section
      id="process"
      className="py-16 sm:py-24 relative bg-[#fafafa] overflow-hidden"
    >
      {/* Subtle Studio Lighting - Calm, architectural, zero harshness or rainbow colors */}
      <div
        className="absolute top-[8%] left-1/3 w-[450px] sm:w-[700px] h-[350px] sm:h-[500px] pointer-events-none -z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(24, 24, 27, 0.035) 0%, rgba(217, 119, 6, 0.025) 45%, transparent 70%)',
          filter: 'blur(50px)',
          transform: 'translateZ(0)',
        }}
      />
      <div
        className="absolute top-[60%] right-1/4 w-[450px] sm:w-[700px] h-[350px] sm:h-[500px] pointer-events-none -z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(24, 24, 27, 0.03) 0%, rgba(14, 165, 233, 0.02) 45%, transparent 70%)',
          filter: 'blur(50px)',
          transform: 'translateZ(0)',
        }}
      />

      {/* Blueprint Ambient Grid Watermark */}
      <div className="absolute inset-0 pointer-events-none blueprint-sheet opacity-50" />

      {/* Technical Registration Crosshairs */}
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
        {/* Process Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-24 relative">
          <div className="inline-flex items-center justify-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 font-mono text-[11px] uppercase tracking-widest font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
            <span>HOW IT WORKS</span>
          </div>

          <h3 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
            {settings?.workshopHeading &&
            settings.workshopHeading !== 'How the story unfolds.' &&
            settings.workshopHeading !== 'From first call to after you hit post.'
              ? settings.workshopHeading
              : 'Four steps from your idea to your audience.'}
          </h3>

          <p className="mt-4 text-zinc-600 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
            Every video starts with understanding you and ends with checking how it landed. Here's how I get there.
          </p>
        </div>

        {/* Process Steps Timeline */}
        <div ref={stepsContainerRef} className="relative">
          {/* Continuous vertical handdrawn squiggly dashed timeline path (desktop) */}
          <svg
            className="hidden lg:block absolute left-[12px] top-6 bottom-10 w-[40px] h-[calc(100%-48px)] pointer-events-none z-0 overflow-visible"
            viewBox="0 0 40 800"
            preserveAspectRatio="none"
          >
            {/* Background dashed squiggly track - handdrawn, organic, flowy */}
            <path
              d="M 20,0 C 13,50 27,100 20,150 C 13,200 27,250 20,300 C 13,350 27,400 20,450 C 13,500 27,550 20,600 C 13,650 27,700 20,750 C 15,775 23,800 20,800"
              fill="none"
              stroke="#d4d4d8"
              strokeWidth="2.2"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />

            {/* Active scroll revealed squiggly dashed line */}
            <motion.path
              d="M 20,0 C 13,50 27,100 20,150 C 13,200 27,250 20,300 C 13,350 27,400 20,450 C 13,500 27,550 20,600 C 13,650 27,700 20,750 C 15,775 23,800 20,800"
              fill="none"
              stroke="#18181b"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
              style={{
                pathLength: stepsScrollProgress,
              }}
            />
          </svg>

          {PROCESS_STEPS.map((step, idx) => (
            <ScrollPhaseItem
              key={step.id}
              step={step}
              idx={idx}
              isLast={idx === PROCESS_STEPS.length - 1}
            />
          ))}
        </div>

        {/* Studio Transition: Connecting directly to Commission */}
        <div className="mt-20 pt-12 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="font-display font-bold text-xl sm:text-2xl text-zinc-950">
              Let's cut your workload in half.
            </h4>
            <p className="text-sm sm:text-base text-zinc-600 font-normal">
              Stop chasing deadlines—partner with me to scale your reach and get recognized.
            </p>
          </div>

          <button
            id="blueprint-start-btn"
            onClick={onStartBooking}
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <span>Let's Go</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
