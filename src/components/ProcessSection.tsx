import React, { useRef } from 'react';
import {
  ArrowUpRight,
  Sparkles,
  Scissors,
  Volume2,
  CheckCircle,
} from 'lucide-react';
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
  subtitle: string;
  icon: string;
  description: string;
  handwrittenNote: string;
}

// Authentic hand-drawn organic circular paths for each phase step (individually styled for human irregularity)
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
 * ScrollPhaseItem: Viewport scroll-reactive phase item with fluid, organic gradient background accents,
 * emphasized gradient typography, hand-drawn circular number marker with pop + fill, and natural handwritten notes.
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
        <h4 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <span>Deconstructing the</span>
          <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent font-bold">
            Narrative
          </span>
        </h4>
      );
    }

    if (step.id === 3) {
      return (
        <h4 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <span>Emotional Rhythm &amp;</span>
          <span className="bg-gradient-to-r from-sky-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent font-bold">
            Subconscious Sound
          </span>
        </h4>
      );
    }

    return (
      <h4 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
        <span>Visual Prestige &amp;</span>
        <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent font-bold">
          Delivery
        </span>
      </h4>
    );
  };

  return (
    <div
      ref={itemRef}
      className={`relative grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start ${
        !isLast ? 'pb-16 sm:pb-24' : ''
      }`}
    >
      {/* Col A: Natural Hand-drawn Circular Phase Marker with Pop + Fill */}
      <div className="lg:col-span-2 flex items-center lg:items-start gap-4 lg:gap-3 relative z-10">
        <div className="relative">
          <motion.div
            animate={{
              scale: isInView ? [1, 1.14, 1] : 1,
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center relative select-none"
          >
            {/* Hand-drawn authentic ink shape: zero residue because stroke and fill belong to the same path */}
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

          {/* Floating Action Glyph */}
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs border transition-colors z-20 ${
              isInView
                ? 'bg-white text-zinc-950 border-zinc-300'
                : 'bg-zinc-100 text-zinc-500 border-zinc-200'
            }`}
          >
            {step.id === 1 && <Sparkles className="w-3 h-3" />}
            {step.id === 2 && <Scissors className="w-3 h-3" />}
            {step.id === 3 && <Volume2 className="w-3 h-3" />}
            {step.id === 4 && <CheckCircle className="w-3 h-3" />}
          </div>
        </div>
      </div>

      {/* Col B: Main Narrative Content with Fluid Organic Shapes */}
      <div className="lg:col-span-10 space-y-3 relative z-10">
        {/* Fluid Organic Accent Blobs - subtle, luminous aura framing each phase across all displays */}
        {step.id === 1 && (
          <div
            className="absolute -top-6 -right-8 sm:-right-12 w-48 sm:w-72 h-48 sm:h-64 bg-violet-400/14 blur-3xl pointer-events-none -z-10"
            style={{ borderRadius: '63% 37% 54% 46% / 44% 59% 41% 56%' }}
          />
        )}
        {step.id === 2 && (
          <div
            className="absolute -top-6 -left-8 sm:-left-12 w-48 sm:w-72 h-48 sm:h-64 bg-amber-400/14 blur-3xl pointer-events-none -z-10"
            style={{ borderRadius: '48% 52% 64% 36% / 58% 38% 62% 42%' }}
          />
        )}
        {step.id === 3 && (
          <div
            className="absolute -top-6 -right-8 sm:-right-12 w-48 sm:w-72 h-48 sm:h-64 bg-sky-400/14 blur-3xl pointer-events-none -z-10"
            style={{ borderRadius: '39% 61% 56% 44% / 63% 47% 53% 37%' }}
          />
        )}
        {step.id === 4 && (
          <div
            className="absolute -top-6 -left-8 sm:-left-12 w-48 sm:w-72 h-48 sm:h-64 bg-emerald-400/14 blur-3xl pointer-events-none -z-10"
            style={{ borderRadius: '57% 43% 36% 64% / 45% 61% 39% 55%' }}
          />
        )}

        <div>
          {renderTitle()}
          <p className="text-xs sm:text-sm font-mono text-zinc-500 mt-1 uppercase tracking-wider">
            {step.subtitle}
          </p>
        </div>

        <p className="text-zinc-600 text-sm sm:text-base font-normal leading-relaxed max-w-3xl">
          {step.description}
        </p>

        {/* Natural Handwritten Note (Pure cursive without stiff boxes or label tags) */}
        {step.handwrittenNote && (
          <div className="pt-2">
            <p className="font-handwriting text-lg sm:text-xl text-zinc-600 italic">
              {step.handwrittenNote}
            </p>
          </div>
        )}
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
      title: settings?.step1Title || 'Identifying You',
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
      subtitle: settings?.step2Subtitle || 'Ruthless Dissection & Trimming the Fat',
      icon: '✂',
      description:
        settings?.step2Description ||
        'Every raw timeline is bloated with comfort footage and dead air. We break your narrative down to its absolute bare skeleton. Dissecting the raw rushes, unearthing unexpected gold in second takes, and mapping out the viewer retention curve. Every single second on the timeline must justify its existence or get cut. It’s an intentional, honest breakdown until only pure substance remains.',
      handwrittenNote:
        settings?.step2Note ||
        'Cut the safety filler. If it doesn’t push the story forward, it dies here.',
    },
    {
      id: 3,
      number: '03',
      title: settings?.step3Title || 'Emotional Rhythm & Subconscious Sound',
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
      subtitle: settings?.step4Subtitle || 'Color Science, Key-Art & Cultural Authority',
      icon: '✓',
      description:
        settings?.step4Description ||
        'The final synthesis. Film-grade DaVinci color science with custom highlight rolloff, skin-tone preservation, kinetic typography, and high-CTR thumbnail packaging that stops the infinite scroll. When we export, your project looks and sounds like a studio production that commands immediate respect and builds long-term authority.',
      handwrittenNote:
        settings?.step4Note ||
        'Ready for export. Approved for master release across all formats.',
    },
  ];

  return (
    <section
      id="process"
      className="py-16 sm:py-24 relative bg-[#fafafa] overflow-hidden"
    >
      {/* Fluid Organic Gradient Shapes - balanced, clearly visible atmospheric glow hugging the perimeter on all displays */}
      <div
        className="absolute top-[2%] -left-16 sm:-left-36 w-[340px] sm:w-[640px] h-[340px] sm:h-[540px] bg-gradient-to-tr from-violet-500/22 via-fuchsia-400/16 to-rose-400/10 blur-3xl pointer-events-none -z-0"
        style={{ borderRadius: '68% 32% 48% 52% / 38% 65% 35% 62%' }}
      />
      <div
        className="absolute top-[26%] -right-16 sm:-right-36 w-[340px] sm:w-[640px] h-[340px] sm:h-[540px] bg-gradient-to-bl from-amber-500/20 via-orange-400/15 to-rose-400/10 blur-3xl pointer-events-none -z-0"
        style={{ borderRadius: '41% 59% 68% 32% / 64% 34% 66% 36%' }}
      />
      <div
        className="absolute top-[52%] -left-16 sm:-left-36 w-[340px] sm:w-[640px] h-[340px] sm:h-[540px] bg-gradient-to-r from-sky-400/20 via-blue-500/15 to-indigo-500/10 blur-3xl pointer-events-none -z-0"
        style={{ borderRadius: '55% 45% 33% 67% / 47% 62% 38% 53%' }}
      />
      <div
        className="absolute top-[76%] -right-16 sm:-right-36 w-[340px] sm:w-[640px] h-[340px] sm:h-[540px] bg-gradient-to-tl from-emerald-400/20 via-teal-400/15 to-amber-400/10 blur-3xl pointer-events-none -z-0"
        style={{ borderRadius: '46% 54% 60% 40% / 58% 42% 58% 42%' }}
      />

      {/* Blueprint Ambient Grid Watermark */}
      <div className="absolute inset-0 pointer-events-none blueprint-sheet opacity-60" />

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
            WORKFLOW
          </div>

          <h3 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.1] mb-2">
            {settings?.workshopHeading || 'How the story unfolds.'}
          </h3>

          {/* Hand-drawn subtle scribble underline */}
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

          {/* Ruler simulation */}
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

        {/* Free-flow progression track */}
        <div ref={stepsContainerRef} className="relative space-y-16 sm:space-y-24">
          {/* Continuous dashed progression track with gentle curve behind the step markers */}
          <div className="hidden lg:block absolute left-[32px] -translate-x-1/2 top-8 bottom-16 w-12 pointer-events-none z-0">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 48 1000"
              preserveAspectRatio="none"
            >
              <path
                d="M 24 0 C 24 90, 20 150, 24 210 C 28 245, 36 275, 24 310 C 14 340, 16 365, 24 390 C 32 435, 18 500, 24 560 C 28 600, 34 635, 24 680 C 14 720, 18 750, 24 785 C 30 835, 20 890, 24 1000"
                fill="none"
                stroke="#e4e4e7"
                strokeWidth="2"
                strokeDasharray="6 8"
                strokeLinecap="round"
              />

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

        {/* Studio Transition Stamp: Connecting directly to Commission */}
        <div className="mt-20 pt-12 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-dashed border-zinc-900 flex items-center justify-center p-1 rotate-[-4deg] shrink-0">
              <span className="font-mono text-[9px] font-bold text-zinc-900 leading-tight uppercase text-center">
                READY FOR
                <br />
                IMPACT
              </span>
            </div>
            <div>
              <p className="font-display font-bold text-base sm:text-lg text-zinc-950">
                Every cut is made with intention.
              </p>
              <p className="text-xs sm:text-sm text-zinc-500 font-normal">
                No cookie-cutter presets. Ready to see what your footage can do?
              </p>
            </div>
          </div>

          <button
            id="blueprint-start-btn"
            onClick={onStartBooking}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <span>Start Your Project</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
