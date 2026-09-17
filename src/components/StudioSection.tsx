import React from 'react';
import { motion } from 'motion/react';
import { SiteSettings } from '../types';

interface StudioSectionProps {
  onStartBooking?: () => void;
  settings?: SiteSettings;
}

export const StudioSection: React.FC<StudioSectionProps> = ({
  settings,
}) => {
  const heading =
    settings?.aboutHeading || 'Crafting edits that audiences refuse to skip.';

  const bio1 =
    settings?.aboutBio1 ||
    'I’m a director and lead editor dedicated to visual storytelling that grips people from the first second. Over the last four years, I’ve shaped commercial edits, narrative shorts, and high-retention creator cuts totaling over 14 million organic views.';

  const bio2 =
    settings?.aboutBio2 ||
    'My philosophy is simple: cut the safety filler. If a second doesn’t push emotional velocity or drive the narrative forward, it dies on the cutting room floor. The result is pure, high-density momentum.';

  const directorNote =
    settings?.aboutDirectorNote ||
    '“When people watch a great video, they don\'t notice the cuts—they feel the momentum.”';

  const tools = settings?.aboutTools && settings.aboutTools.length > 0
    ? settings.aboutTools
    : ['Premiere Pro', 'After Effects', 'Photoshop', 'YouTube Studio'];

  return (
    <section
      id="about"
      className="pt-10 sm:pt-14 pb-28 sm:pb-36 relative bg-[#fafafa] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Clear Single Ruler Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-4"
          >
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12]">
              {heading}
            </h2>
          </motion.div>

          {/* Right Column: Narrative Body and Minimalist Floating Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 space-y-6 text-zinc-600 text-base sm:text-lg leading-relaxed font-normal"
          >
            <p className="text-zinc-700">
              {bio1}
            </p>

            <p>
              {bio2}
            </p>

            {/* Core Tools Bar - Minimalist, floating without box containers, cleanly aligned */}
            <div className="pt-6 border-t border-zinc-200/80">
              <span className="block text-zinc-400 font-mono text-[10px] uppercase tracking-widest font-semibold mb-3">
                TOOLS
              </span>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-2.5 font-mono text-xs sm:text-sm text-zinc-800">
                {tools.map((tool, idx) => (
                  <span key={idx} className="flex items-center gap-2 font-medium tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Director's Note placed at the last part of the About Me section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 pt-8 border-t border-zinc-200/80"
        >
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-950 max-w-xl rotate-[-0.5deg] shadow-2xs relative">
            <div className="absolute -top-3 left-6 px-3 py-0.5 bg-amber-100/95 border border-amber-300/60 text-[10px] font-mono text-amber-800 rounded-xs uppercase tracking-wider font-semibold -rotate-1">
              DIRECTOR'S NOTE
            </div>
            <p className="font-handwriting text-xl sm:text-2xl leading-relaxed text-zinc-800 pt-1">
              {directorNote}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
