import { VideoProject, GraphicProject } from '../types';

export const ROTATING_ROLES: string[] = [
  'Video Editor',
  'Motion Designer',
  'Graphic Designer',
  'Content Strategist',
  'Channel Manager',
  'Social Media Manager',
];

const createVideoPlaceholderSvg = (title: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" fill="none">
      <rect width="1280" height="720" fill="#18181b"/>
      <rect x="24" y="24" width="1232" height="672" rx="20" stroke="#27272a" stroke-width="2" stroke-dasharray="10 10"/>
      <circle cx="640" cy="330" r="44" fill="#27272a"/>
      <polygon points="634,316 654,330 634,344" fill="#d4d4d8"/>
      <text x="640" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#f4f4f5" text-anchor="middle" letter-spacing="1">${title}</text>
      <text x="640" y="454" font-family="monospace" font-size="13" fill="#71717a" text-anchor="middle" letter-spacing="2">ZOLEPTO STUDIO • WORK PLACEHOLDER</text>
    </svg>
  `)}`;

const createGraphicPlaceholderSvg = (
  title: string,
  aspect: 'portrait' | 'landscape' | 'square' = 'landscape'
) => {
  const w = aspect === 'portrait' ? 800 : aspect === 'square' ? 900 : 1200;
  const h = aspect === 'portrait' ? 1100 : aspect === 'square' ? 900 : 675;
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
      <rect width="${w}" height="${h}" fill="#18181b"/>
      <rect x="20" y="20" width="${w - 40}" height="${h - 40}" rx="16" stroke="#27272a" stroke-width="2" stroke-dasharray="8 8"/>
      <circle cx="${w / 2}" cy="${h / 2 - 24}" r="36" fill="#27272a"/>
      <rect x="${w / 2 - 14}" y="${h / 2 - 38}" width="28" height="28" rx="4" stroke="#a1a1aa" stroke-width="2" fill="none"/>
      <text x="${w / 2}" y="${h / 2 + 36}" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#f4f4f5" text-anchor="middle">${title}</text>
      <text x="${w / 2}" y="${h / 2 + 64}" font-family="monospace" font-size="12" fill="#71717a" text-anchor="middle" letter-spacing="2">DESIGN PLACEHOLDER</text>
    </svg>
  `)}`;
};

export const MAIN_SHOWREEL: VideoProject = {
  id: 'master-showreel-2026',
  title: 'Showreel 1',
  client: 'Zolepto Creative Studio',
  category: 'commercial',
  categoryLabel: 'Director Cut / Reel',
  duration: '1:30',
  year: '2026',
  youtubeId: '',
  embedUrl: '',
  thumbnailUrl: createVideoPlaceholderSvg('Showreel 1'),
  description: 'Zolepto creative showreel demonstrating editorial pacing, motion dynamics, and storytelling.',
  role: 'Lead Editor, Sound Design, Color Grading',
  tags: ['Editing', 'Sound Foley', 'Color Grading'],
  metrics: 'Featured Master Reel',
  views: '1.2M views',
  featured: true,
};

export const VIDEO_PROJECTS: VideoProject[] = [
  {
    id: 'vid-1',
    title: 'Video 1',
    client: 'Client One',
    category: 'commercial',
    categoryLabel: 'Commercial / Brand',
    duration: '0:45',
    year: '2026',
    youtubeId: '',
    embedUrl: '',
    thumbnailUrl: createVideoPlaceholderSvg('Video 1'),
    description: 'Zolepto creative edit demonstrating pacing, sound design, and narrative clarity.',
    role: 'Editorial Pacing & Cut',
    tags: ['Video Editing', 'Sound Design', 'Color'],
    metrics: '94% Client Brand Recall',
    views: '1.4M views',
  },
  {
    id: 'vid-2',
    title: 'Video 2',
    client: 'Client Two',
    category: 'narrative',
    categoryLabel: 'Cinematic Narrative',
    duration: '1:30',
    year: '2026',
    youtubeId: '',
    embedUrl: '',
    thumbnailUrl: createVideoPlaceholderSvg('Video 2'),
    description: 'Zolepto storytelling edit highlighting cinematic rhythm, dialogue balance, and visual structure.',
    role: 'Assembly & Rhythm',
    tags: ['Narrative', 'Pacing', 'Sound Foley'],
    metrics: 'Featured Narrative Cut',
    views: '820K views',
  },
  {
    id: 'vid-3',
    title: 'Video 3',
    client: 'Client Three',
    category: 'short-form',
    categoryLabel: 'High-Retention Short Form',
    duration: '0:50',
    year: '2026',
    youtubeId: '',
    embedUrl: '',
    thumbnailUrl: createVideoPlaceholderSvg('Video 3'),
    description: 'Zolepto short-form retention edit structured for high viewer engagement and hook pacing.',
    role: 'Hook & Retention Structure',
    tags: ['Short-Form', 'Kinetic Cuts', 'Pacing'],
    metrics: '8.7M Combined Views',
    views: '8.7M views',
  },
  {
    id: 'vid-4',
    title: 'Video 4',
    client: 'Client Four',
    category: 'motion',
    categoryLabel: 'Motion & Visuals',
    duration: '1:15',
    year: '2025',
    youtubeId: '',
    embedUrl: '',
    thumbnailUrl: createVideoPlaceholderSvg('Video 4'),
    description: 'Zolepto motion project exploring typography animation, kinetic layouts, and rhythm.',
    role: 'Motion Graphics & Animation',
    tags: ['Motion Graphics', 'Typography', 'Visuals'],
    metrics: 'Official Brand Identity',
    views: '1.2M views',
  },
  {
    id: 'vid-5',
    title: 'Video 5',
    client: 'Client Five',
    category: 'commercial',
    categoryLabel: 'Commercial / Brand',
    duration: '1:00',
    year: '2025',
    youtubeId: '',
    embedUrl: '',
    thumbnailUrl: createVideoPlaceholderSvg('Video 5'),
    description: 'Zolepto commercial project featuring modern framing, sound design, and color finishing.',
    role: 'Commercial Assembly & Grade',
    tags: ['Commercial', 'Color Grade', 'Audio'],
    metrics: 'National Campaign Cut',
    views: '640K views',
  },
  {
    id: 'vid-6',
    title: 'Video 6',
    client: 'Client Six',
    category: 'narrative',
    categoryLabel: 'Cinematic Narrative',
    duration: '1:45',
    year: '2025',
    youtubeId: '',
    embedUrl: '',
    thumbnailUrl: createVideoPlaceholderSvg('Video 6'),
    description: 'Zolepto documentary sequence showcasing authentic interviews, environmental sound, and pacing.',
    role: 'Documentary Cut & Pacing',
    tags: ['Documentary', 'Soundscape', 'Timeline'],
    metrics: 'Festival Selection Cut',
    views: '2.1M views',
  },
];

export const GRAPHIC_PROJECTS: GraphicProject[] = [
  {
    id: 'graph-1',
    title: 'Graphic 1',
    client: 'Client Brand A',
    category: 'key-art',
    categoryLabel: 'Key Art & Poster',
    imageUrl: createGraphicPlaceholderSvg('Graphic 1', 'portrait'),
    aspect: 'portrait',
    year: '2026',
    description: 'Zolepto graphic design piece focusing on visual hierarchy, typography, and contrast.',
    tools: ['Photoshop', 'Illustrator'],
  },
  {
    id: 'graph-2',
    title: 'Graphic 2',
    client: 'Client Brand B',
    category: 'thumbnails',
    categoryLabel: 'Digital Thumbnail',
    imageUrl: createGraphicPlaceholderSvg('Graphic 2', 'landscape'),
    aspect: 'landscape',
    year: '2026',
    description: 'Zolepto digital thumbnail design built for clarity, focal subject pop, and high visual interest.',
    tools: ['Photoshop', 'Lighting'],
  },
  {
    id: 'graph-3',
    title: 'Graphic 3',
    client: 'Client Brand C',
    category: 'styleframes',
    categoryLabel: 'Styleframe Design',
    imageUrl: createGraphicPlaceholderSvg('Graphic 3', 'square'),
    aspect: 'square',
    year: '2025',
    description: 'Zolepto styleframe exploring modern composition, grid layouts, and minimalist aesthetics.',
    tools: ['Figma', 'Illustrator'],
  },
  {
    id: 'graph-4',
    title: 'Graphic 4',
    client: 'Client Brand D',
    category: 'key-art',
    categoryLabel: 'Cover Art & Packaging',
    imageUrl: createGraphicPlaceholderSvg('Graphic 4', 'portrait'),
    aspect: 'portrait',
    year: '2025',
    description: 'Zolepto key art exploring typography, texture, and visual balance.',
    tools: ['Photoshop', 'Typography'],
  },
  {
    id: 'graph-5',
    title: 'Graphic 5',
    client: 'Client Brand E',
    category: 'styleframes',
    categoryLabel: 'Visual Identity',
    imageUrl: createGraphicPlaceholderSvg('Graphic 5', 'landscape'),
    aspect: 'landscape',
    year: '2026',
    description: 'Zolepto styleframe sequence designed to set art direction and graphic language.',
    tools: ['After Effects', 'Photoshop'],
  },
  {
    id: 'graph-6',
    title: 'Graphic 6',
    client: 'Client Brand F',
    category: 'thumbnails',
    categoryLabel: 'Media Art',
    imageUrl: createGraphicPlaceholderSvg('Graphic 6', 'landscape'),
    aspect: 'landscape',
    year: '2026',
    description: 'Zolepto graphic layout balancing bold typography and clean composition.',
    tools: ['Photoshop', 'Graphic Layout'],
  },
];

export const WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'The Narrative Core',
    description: 'We unpack your raw footage, establish the emotional arc, and lock down the primary rhythm before touching transitions.',
  },
  {
    number: '02',
    title: 'Pacing & Structural Cut',
    description: 'Building tension and micro-hooks. Trimming every surplus frame so the story maintains magnetic viewer momentum.',
  },
  {
    number: '03',
    title: 'Sound Architecture & Foley',
    description: 'Audio carries 70% of cinematic perception. We craft bespoke riser sweeps, sub-drops, foley layers, and master volume dynamics.',
  },
  {
    number: '04',
    title: 'Color Science & Delivery',
    description: 'Custom film emulation, skin-tone preservation, and multi-format exports optimized for YouTube 4K, cinemas, or vertical platforms.',
  },
];

export const TECHNICAL_SKILLS = [
  { name: 'Adobe Premiere Pro', category: 'Assembly & Timeline Editing', level: '10+ yrs' },
  { name: 'DaVinci Resolve Studio', category: 'Color Grading & Film Science', level: 'Advanced' },
  { name: 'Adobe After Effects', category: 'Motion Graphics & VFX Compositing', level: 'Expert' },
  { name: 'Audition & Logic Pro', category: 'Sound Design, Foley & Mixing', level: 'Mastery' },
  { name: 'Adobe Photoshop', category: 'Thumbnails & Graphic Key-Art', level: '10+ yrs' },
  { name: 'Blender & Cinema 4D', category: '3D Titles & Camera Projection', level: 'Proficient' },
];
