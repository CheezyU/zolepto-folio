import React, { useState } from 'react';
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
import { motion } from 'motion/react';
import { SiteSettings } from '../types';

interface AboutSectionProps {
  onStartBooking: () => void;
  settings?: SiteSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onStartBooking, settings }) => {
  const [activeStepHover, setActiveStepHover] = useState<number | null>(null);

  const quote =
    settings?.aboutQuote ||
    '“An edit isn’t just assembling footage. It’s an emotional rhythm that decides whether a viewer clicks away in three seconds or stays until the final frame.”';
  const bio1 =
    settings?.aboutBio1 ||
    'I’m Zolepto Hiraya. For over four years, I’ve lived inside the timeline—obsessing over the millisecond a cut lands, why retention drops at forty-five seconds, and how subconscious sound design transforms an ordinary video into an unforgettable experience.';
  const bio2 =
    settings?.aboutBio2 ||
    'I partner directly with creators, founders, and ambitious brands. No junior handoffs, no agency bloat. You work directly with me from raw footage ingest to final sound mix and cinematic color grade.';

  const PROCESS_STEPS = [
    {
      id: 1,
      number: '01',
      title: 'Identifying You',
      tag: '[ PHASE 01 // SIGNAL EXTRACTION ]',
      timecode: 'TC 00:00:00:00',
      subtitle: 'The Core Signal & Creative DNA',
      description:
        'Before a single clip is dragged to the timeline or a cut is made, we identify you. Who you are, what your voice stands for, who your real audience is, and the psychological hook that makes your content undeniably yours. We don’t copy trends or use cookie-cutter templates—we locate your authentic edge and reverse-engineer the entire narrative around it.',
      handwrittenNote: '“Who you are > fancy transitions. This is where real retention is born.”',
      doodleType: 'circle-signal',
      accentColor: 'text-zinc-900',
      tagColor: 'bg-zinc-100 text-zinc-800',
    },
    {
      id: 2,
      number: '02',
      title: 'Deconstructing the Narrative',
      tag: '[ PHASE 02 // THE BREAKDOWN ]',
      timecode: 'TC 00:01:24:12',
      subtitle: 'Ruthless Dissection & Trimming the Fat',
      description:
        'Every raw timeline is bloated with comfort footage and dead air. We break your narrative down to its absolute bare skeleton. Dissecting the raw rushes, unearthing unexpected gold in second takes, and mapping out the viewer retention curve. Every single second on the timeline must justify its existence or get cut. It’s an intentional, honest breakdown until only pure substance remains.',
      handwrittenNote: '✂ Cut the safety filler. If it doesn’t push the story forward, it dies here.',
      doodleType: 'scissor-cut',
      accentColor: 'text-zinc-900',
      tagColor: 'bg-zinc-100 text-zinc-800',
    },
    {
      id: 3,
      number: '03',
      title: 'Emotional Rhythm & Subconscious Sound',
      tag: '[ PHASE 03 // ACOUSTIC ARCHITECTURE ]',
      timecode: 'TC 00:02:48:06',
      subtitle: 'The Kinetic Pulse & Visceral Foley',
      description:
        'Pacing isn’t raw speed—it’s tension, breath, and release. We sculpt the cut to an auditory heartbeat: layering subconscious micro-risers, tactile foley, deep sub-bass drops, and room ambience that viewers feel in their chest before their eyes even register it. Audio carries 70% of cinematic perception; we treat sound as equal to the picture.',
      handwrittenNote: 'Subconscious audio cues [40Hz - 12kHz] — feel it in the headphones 🎧',
      doodleType: 'sound-wave',
      accentColor: 'text-zinc-900',
      tagColor: 'bg-zinc-100 text-zinc-800',
    },
    {
      id: 4,
      number: '04',
      title: 'Visual Prestige & Delivery',
      tag: '[ PHASE 04 // MASTER POLISH & LAUNCH ]',
      timecode: 'TC 00:04:12:00',
      subtitle: 'Color Science, Key-Art & Cultural Authority',
      description:
        'The final synthesis. Film-grade DaVinci color science with custom highlight rolloff, skin-tone preservation, kinetic typography, and high-CTR thumbnail packaging that stops the infinite scroll. When we export, your project looks and sounds like a studio production that commands immediate respect and builds long-term authority.',
      handwrittenNote: '✦ Ready for export. Approved for master release across all formats.',
      doodleType: 'star-master',
      accentColor: 'text-zinc-900',
      tagColor: 'bg-zinc-100 text-zinc-800',
    },
  ];

  return (
    <section
      id="about"
      className="py-24 sm:py-32 relative rounded-t-[36px] sm:rounded-t-[48px] -mt-8 sm:-mt-12 z-30 border-t border-zinc-200/90 bg-[#fafafa] shadow-[0_-24px_50px_rgba(0,0,0,0.06)] overflow-hidden"
    >
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
        {/* TOP EDITORIAL: PERSONAL STORY & PHILOSOPHY */}
        {/* ============================================================ */}
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
              <span>WHO WE ARE & HOW WE WORK</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12]">
              Crafting edits that audiences refuse to skip.
            </h2>

            {/* Hand-drawn sticky note decoration */}
            <div className="relative inline-block mt-2">
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-950 max-w-sm rotate-[-1deg] shadow-2xs">
                {/* Washi tape strip */}
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

        {/* ============================================================ */}
        {/* THE BLUEPRINT WORKSHOP PROCESS: FREE FLOW & HAND-DRAWN       */}
        {/* NO HARD CARD BOUNDARIES — NATURAL WORKSHOP BREAKDOWN         */}
        {/* ============================================================ */}
        <div id="process" className="mt-28 pt-20 border-t border-zinc-200/90 relative">
          {/* Blueprint Header */}
          <div className="max-w-3xl mb-16 relative">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded bg-zinc-900 text-white font-mono text-[11px] uppercase tracking-wider font-semibold">
                WORKSHOP BLUEPRINT
              </span>
              <span className="text-zinc-400 font-mono text-xs">
                // PROGRESSION & BREAKDOWN
              </span>
            </div>

            <h3 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950">
              How the story unfolds.
            </h3>

            <p className="mt-3 text-base sm:text-lg text-zinc-600 font-body">
              No rigid agency steps or generic templates. A deliberate, human creative process mapped out like a workshop drafting sheet—breaking things down to discover what truly resonates.
            </p>

            {/* Blueprint ruler simulation */}
            <div className="mt-6 flex items-center gap-1 overflow-hidden opacity-40 select-none pointer-events-none text-[9px] font-mono text-zinc-400">
              <span>0IN</span>
              <span className="flex-1 border-b border-dashed border-zinc-400" />
              <span>|···|···|···|···|</span>
              <span className="flex-1 border-b border-dashed border-zinc-400" />
              <span>12IN</span>
              <span className="flex-1 border-b border-dashed border-zinc-400" />
              <span>24IN</span>
            </div>
          </div>

          {/* FREE-FLOW PROGRESSION CONTAINER: No hard card borders! */}
          <div className="relative space-y-16 sm:space-y-24">
            {/* Hand-drawn connecting path running through the steps (visible on md screens) */}
            <div className="hidden lg:block absolute left-[38px] top-12 bottom-16 w-0.5 border-l-2 border-dashed border-zinc-300 pointer-events-none" />

            {PROCESS_STEPS.map((step, idx) => {
              const isHovered = activeStepHover === step.id;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: idx * 0.1 }}
                  onMouseEnter={() => setActiveStepHover(step.id)}
                  onMouseLeave={() => setActiveStepHover(null)}
                  className="relative group transition-all duration-300"
                >
                  {/* Organic layout: NO card border, purely breathable typography & hand-drawn annotations */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
                    
                    {/* Left Step Marker with Hand-Drawn Imperfect Circle */}
                    <div className="lg:col-span-4 flex items-start gap-4">
                      {/* Hand-Drawn Sketch Circle around number */}
                      <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
                        <svg
                          viewBox="0 0 100 100"
                          className={`absolute inset-0 w-full h-full transition-transform duration-300 ${
                            isHovered ? 'scale-110 rotate-12 text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-700'
                          }`}
                        >
                          {/* Organic imperfect hand-drawn circle path */}
                          <path
                            d="M 50,8 C 76,6 94,22 93,51 C 92,78 74,94 48,93 C 21,92 7,74 8,47 C 9,21 28,10 52,8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="font-display font-bold text-xl text-zinc-900 relative z-10">
                          {step.number}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="font-mono text-[11px] text-zinc-400 block tracking-wider">
                          {step.timecode}
                        </span>
                        <h4 className="font-display text-xl sm:text-2xl font-bold text-zinc-950 group-hover:text-zinc-800 transition-colors">
                          {step.title}
                        </h4>
                        <span className="text-xs font-mono text-zinc-500 block">
                          {step.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Right Narrative & Hand-drawn Workshop Note */}
                    <div className="lg:col-span-8 space-y-4">
                      {/* Blueprint phase tag */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded">
                          {step.tag}
                        </span>
                        {idx === 0 && (
                          <span className="font-handwriting text-lg text-emerald-700 font-semibold">
                            ✦ user favorite core step
                          </span>
                        )}
                        {idx === 1 && (
                          <span className="font-handwriting text-lg text-rose-700 font-semibold">
                            ✂ the breakdown begins
                          </span>
                        )}
                        {idx === 2 && (
                          <span className="font-handwriting text-lg text-indigo-700 font-semibold">
                            ♫ 40Hz sub-bass layer
                          </span>
                        )}
                        {idx === 3 && (
                          <span className="font-handwriting text-lg text-amber-700 font-semibold">
                            ✓ export locked
                          </span>
                        )}
                      </div>

                      {/* The Main Narrative */}
                      <p className="text-zinc-700 text-base sm:text-lg leading-relaxed font-body">
                        {step.description}
                      </p>

                      {/* Hand-drawn Commentary Annotation with rough doodle */}
                      <div className="pt-2 flex items-center gap-3">
                        {/* Hand-drawn arrow SVG */}
                        <svg
                          className="w-7 h-7 text-zinc-400 flex-shrink-0"
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

                        <p className="font-handwriting text-xl sm:text-2xl text-zinc-800 font-medium tracking-wide">
                          {step.handwrittenNote}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Free-flowing subtle hand-drawn separator (no rigid card edges) */}
                  {idx < PROCESS_STEPS.length - 1 && (
                    <div className="mt-12 sm:mt-16 pt-2 flex items-center gap-4 text-zinc-300">
                      <div className="w-2 h-2 rounded-full bg-zinc-300" />
                      <div className="flex-1 border-t border-dashed border-zinc-200" />
                      <span className="font-mono text-[10px] text-zinc-400">
                        CONTINUE BREAKDOWN &darr;
                      </span>
                      <div className="flex-1 border-t border-dashed border-zinc-200" />
                      <div className="w-2 h-2 rounded-full bg-zinc-300" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Blueprint Workshop Summary Stamp Footer */}
          <div className="mt-20 pt-12 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {/* Stamp-like circle */}
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
      </div>
    </section>
  );
};
