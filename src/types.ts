export type VideoCategory = 'all' | 'commercial' | 'narrative' | 'short-form' | 'motion';

export interface VideoProject {
  id: string;
  title: string;
  client: string;
  category: VideoCategory;
  categoryLabel: string;
  duration: string;
  year: string;
  youtubeId: string;
  embedUrl: string;
  thumbnailUrl: string;
  description: string;
  role: string;
  tags: string[];
  metrics?: string;
  aspectRatio?: '16/9' | '9/16';
  featured?: boolean;
}

export type GraphicCategory = 'all' | 'key-art' | 'thumbnails' | 'branding' | 'styleframes';

export interface GraphicProject {
  id: string;
  title: string;
  client: string;
  category: GraphicCategory;
  categoryLabel: string;
  imageUrl: string;
  aspect: 'portrait' | 'landscape' | 'square';
  year: string;
  description: string;
  tools: string[];
}

export interface ConsultationFormState {
  fullName: string;
  email: string;
  projectType: string;
  estimatedBudget: string;
  brief: string;
  links?: string;
}

export interface SubmittedBooking extends ConsultationFormState {
  id: string;
  submittedAt: string;
  status?: 'new' | 'reviewed' | 'contacted';
  createdAt?: any;
}

export interface SiteSettings {
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  availabilityStatus: string;
  showAvailabilityDot: boolean;
  aboutHeading: string;
  aboutQuote: string;
  aboutBio1: string;
  aboutBio2: string;
  contactEmail: string;
  featuredReelYoutubeId?: string;
  featuredReelTitle?: string;
}

export interface SecurityLogEntry {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
}
