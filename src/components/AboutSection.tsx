import React from 'react';
import { ProcessSection } from './ProcessSection';
import { StudioSection } from './StudioSection';
import { SiteSettings } from '../types';

interface AboutSectionProps {
  onStartBooking: () => void;
  settings?: SiteSettings;
}

/**
 * AboutSection: Unified export providing ProcessSection & StudioSection.
 */
export const AboutSection: React.FC<AboutSectionProps> = ({ onStartBooking, settings }) => {
  return (
    <>
      <ProcessSection onStartBooking={onStartBooking} settings={settings} />
      <StudioSection onStartBooking={onStartBooking} settings={settings} />
    </>
  );
};

export { ProcessSection, StudioSection };
