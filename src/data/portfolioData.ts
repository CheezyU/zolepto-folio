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
    title: 'High-Retention Hook Cut',
    client: 'Apex Media',
    category: 'short-form',
    categoryLabel: 'YouTube Shorts / Reels',
    duration: '0:42',
    year: '2026',
    youtubeId: '',
    embedUrl: 'https://www.youtube.com/shorts/3i_JmO7b2Uo',
    thumbnailUrl: createShortsPlaceholderSvg('High-Retention Hook Cut', 'YouTube Shorts'),
    description: 'Zolepto short-form retention edit structured for high viewer engagement and hook pacing.',
    role: 'Hook & Retention Structure',
    tags: ['Short-Form', 'Kinetic Cuts', 'Pacing', 'Shorts'],
    metrics: '8.7M Combined Views',
    views: '8.7M views',
    aspectRatio: '9/16',
  },
  {
    id: 'vid-short-2',
    title: 'Kinetic Typography Drop',
    client: 'Volt Sound',
    category: 'short-form',
    categoryLabel: 'Instagram Reel',
    duration: '0:28',
    year: '2026',
    youtubeId: '',
    embedUrl: 'https://www.instagram.com/reel/C8_z0kSOP2g/',
    thumbnailUrl: createShortsPlaceholderSvg('Kinetic Typography Drop', 'Instagram Reel'),
    description: 'High-energy audio reactive typography cut optimized for Instagram Reels and viral discovery.',
    role: 'Motion Design & Sound Sync',
    tags: ['Reels', 'Instagram', 'Typography', 'Audio'],
    metrics: '4.2M Reels Reach',
    views: '4.2M views',
    aspectRatio: '9/16',
  },
  {
    id: 'vid-short-3',
    title: 'Micro-Storytelling Hook',
    client: 'HyperCraft',
    category: 'short-form',
    categoryLabel: 'TikTok Viral Cut',
    duration: '0:35',
    year: '2026',
    youtubeId: '',
    embedUrl: 'https://www.tiktok.com/@zolepto/video/7234567890123456789',
    thumbnailUrl: createShortsPlaceholderSvg('Micro-Storytelling Hook', 'TikTok'),
    description: 'Punchy 3-second hook structure with quick-cut visual b-roll and narrative pacing for TikTok.',
    role: 'Retention Edit & Sound Design',
    tags: ['TikTok', 'Retention', 'Micro-Story'],
    metrics: '3.1M Views • 240K Likes',
    views: '3.1M views',
    aspectRatio: '9/16',
  },
  {
    id: 'vid-short-4',
    title: 'Product Drop Velocity',
    client: 'Nexus Gear',
    category: 'short-form',
    categoryLabel: 'FB / IG Reels',
    duration: '0:30',
    year: '2026',
    youtubeId: '',
    embedUrl: 'https://www.facebook.com/reel/9876543210',
    thumbnailUrl: createShortsPlaceholderSvg('Product Drop Velocity', 'FB / IG Reel'),
    description: 'Sleek product reveal short engineered for dynamic mobile feeds with cinematic macro transitions.',
    role: 'Macro Assembly & Color Grade',
    tags: ['Reels', 'Shorts', 'Product', 'Velocity'],
    metrics: '1.8M Feed Impressions',
    views: '1.8M views',
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
