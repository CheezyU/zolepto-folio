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
    settings?.aboutHeading &&
    settings.aboutHeading !== 'About' &&
    settings.aboutHeading !== 'Crafting edits that audiences refuse to skip.' &&
    settings.aboutHeading !== 'Who I am. My background.'
      ? settings.aboutHeading
      : 'Background & Approach';

  const bio1 =
    settings?.aboutBio1 && !settings.aboutBio1.includes('Over the last four years')
      ? settings.aboutBio1
      : "I'm Zolepto. Six years ago, I started a channel with zero knowledge and grew it from the ground up. Every mistake became a building block, and along the way I picked up video editing, motion design, thumbnails, and branding.";

  const bio2 =
    settings?.aboutBio2 && !settings.aboutBio2.includes('My philosophy is simple')
      ? settings.aboutBio2
      : "Because I've built a channel myself, I don't see your project as just another editing gig. I see it the way a content strategist would: what makes people click, stay, and come back.";

  const bio3 =
    settings?.aboutBio3 && settings.aboutBio3.trim() !== ''
      ? settings.aboutBio3
      : "I keep my ego out of the room. I'm still hungry, still learning, and always adapting, so your brand keeps moving forward.";

  const tools = settings?.aboutTools && settings.aboutTools.length > 0
    ? settings.aboutTools
    : ['Premiere Pro', 'After Effects', 'Photoshop', 'YouTube Studio'];

  return (
    <section
      id="about"
      className="pt-10 sm:pt-14 pb-20 sm:pb-28 relative bg-[#fafafa] overflow-hidden"
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

            <p>
              {bio3}
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
      </div>
    </section>
  );
};
