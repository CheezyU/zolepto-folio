import { VideoProject, GraphicProject } from '../types';
import { createShortsPlaceholderSvg } from '../lib/videoEmbed';

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
  title: 'ZOLEPTO — 2026 Director & Editing Master Showreel',
  client: 'Zolepto Creative Studio',
  category: 'commercial',
  categoryLabel: 'Director Cut / Reel',
  duration: '1:30',
  year: '2026',
  youtubeId: 'aqz-KE-bpKQ',
  embedUrl: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0&modestbranding=1',
  thumbnailUrl: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/maxresdefault.jpg',
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
    youtubeId: '5FnQs_sy5iI',
    embedUrl: 'https://www.youtube-nocookie.com/embed/5FnQs_sy5iI?rel=0&modestbranding=1',
    thumbnailUrl: 'https://i.ytimg.com/vi/5FnQs_sy5iI/maxresdefault.jpg',
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
    title: 'Game Bug Discovery',
    client: 'SleekToast',
    category: 'short-form',
    categoryLabel: 'Entertainment',
    duration: '0:50',
    year: '2026',
    youtubeId: 'pgxS2qs_hUI',
    embedUrl: 'https://www.youtube-nocookie.com/embed/pgxS2qs_hUI?rel=0&modestbranding=1',
    thumbnailUrl: 'https://i.ytimg.com/vi/pgxS2qs_hUI/maxresdefault.jpg',
    description: 'Inspired by Camman18, captivating visuals that are simple and lifts the progressive storytelling.',
    role: 'Creator',
    tags: ['Short-Form', 'Storytelling'],
    metrics: '8.7M Combined Views',
    views: '8.7M views',
    youtubeUrl: 'https://www.youtube.com/watch?v=pgxS2qs_hUI',
    aspectRatio: '9/16',
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
    id: 'graph-2',
    title: "Sleek's banner",
    client: 'SleekToast',
    category: 'styleframe',
    categoryLabel: 'Digital Thumbnail',
    imageUrl: 'https://i.ibb.co/JWN6yRBd/New-BLue-Banner.png',
    aspect: 'landscape',
    year: '2026',
    description: 'A classic 3d render ugc for roblox content creators with cinematic lighting',
    tools: ['Photoshop', 'Blender'],
  },
  {
    id: 'graph-4',
    title: 'MotionGrind Concept',
    client: 'MotionGrind',
    category: 'styleframe',
    categoryLabel: 'Cover Art & Packaging',
    imageUrl: 'https://i.ibb.co/21FL2QRq/MG-12.png',
    aspect: 'portrait',
    year: '2025',
    description: 'The concept for personal brands building connections from viewers into high ticket customers.',
    tools: ['Photoshop', 'Typography'],
  },
  {
    id: 'graph-3',
    title: "Koza's Banner",
    client: 'KozaEyes',
    category: 'styleframe',
    categoryLabel: 'Styleframe Design',
    imageUrl: 'https://i.ibb.co/xt6nCpwr/Kazo-Eyes-banner.png',
    aspect: 'landscape',
    year: '2025',
    description: 'Modern clean and simple banner for a storytelling clipper.',
    tools: ['Photoshop'],
  },
  {
    id: 'graphic-1789874511012',
    title: "WestWard's Banner",
    client: 'Blood Barrel',
    category: 'key-art',
    categoryLabel: 'KEY-ART',
    imageUrl: 'https://i.ibb.co/twszZPcp/loleq3.jpg',
    aspect: 'portrait',
    year: '2026',
    description: 'Features heavy graphics and effects with the iconic Mike Tyson shot and a progress bar for engagement',
    tools: ['Photoshop'],
  },
  {
    id: 'graphic-1789874407223',
    title: 'Simple Banner',
    client: 'Studio Art',
    category: 'styleframe',
    categoryLabel: 'STYLEFRAME',
    imageUrl: 'https://i.ibb.co/JWHppkwY/1-WHO-SAID-I-CNAT.jpg',
    aspect: 'portrait',
    year: '2026',
    description: '',
    tools: ['Photoshop'],
  },
];

export const WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'Identifying YOU',
    description: "I start with you: your authentic side, what your content stands for, and who you're actually trying to reach. Your content and ideas come first, before I touch the footage.",
  },
  {
    number: '02',
    title: 'Dissecting the Narrative',
    description: "The value of your content matters more than flashy edits. I lift your story in the style you envision, and every cut, effect, and transition has to serve the progression of the video.",
  },
  {
    number: '03',
    title: 'Look Beyond the Process',
    description: "I step out of editing mode and actually watch it as your own viewer would. Does the edit elevate the story? Was it worth watching? Every second has to be justified.",
  },
  {
    number: '04',
    title: 'Official Drop',
    description: "Multiple passes, with every cut, layer, and effect double-checked, then delivered on the promised date. Total transparency, zero ghosting, and easy collaboration.",
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
