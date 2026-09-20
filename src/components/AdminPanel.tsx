import React, { useState, useEffect, useRef } from 'react';
import {
  LogOut,
  ArrowLeft,
  Film,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Inbox,
  Clock,
  Copy,
  Check,
  Send,
  Pencil,
  X,
  Lock,
  ShieldCheck,
  Globe,
  Sliders,
  Sparkles,
  Eye,
  RefreshCw,
  GitBranch,
  Mail,
  Smartphone,
  GripVertical,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  VideoProject,
  GraphicProject,
  VideoCategory,
  GraphicCategory,
  SubmittedBooking,
  SiteSettings,
  SecurityLogEntry,
} from '../types';
import {
  extractYouTubeId,
  buildYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  upgradeYouTubeThumbnailUrl,
  handleThumbnailImageError,
  handleThumbnailImageLoad,
} from '../lib/youtube';
import { parseVideoUrl, isShortFormVideo } from '../lib/videoEmbed';
import { cleanImageUrl, detectImgbbFormat, resolveImgbbViewerUrl } from '../lib/imageUtils';
import {
  addShowreel,
  updateShowreel,
  deleteShowreel,
  addGraphicDesign,
  updateGraphicDesign,
  deleteGraphicDesign,
  reorderCategoryInVideos,
  reorderGraphicsList,
} from '../services/portfolioService';
import {
  subscribeToInquiries,
  deleteInquiry,
  updateInquiryStatus,
  buildMailtoUrl,
  buildGmailWebUrl,
} from '../services/inquiryService';
import {
  subscribeToSiteSettings,
  updateSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '../services/siteSettingsService';
import { GitHubSyncTab } from './admin/GitHubSyncTab';
import { SecurityTab } from './admin/SecurityTab';
import { VisualCopyEditor } from './admin/VisualCopyEditor';
import {
  pushPortfolioToGitHub,
  getGitHubConfig,
  hasPortfolioChangesToPublish,
} from '../services/githubSyncService';

interface AdminPanelProps {
  onBackToPortfolio: () => void;
  showreels: VideoProject[];
  graphics: GraphicProject[];
}

const SECURITY_LOGS_KEY = 'zolepto_security_audit_logs';

function getSecurityLogs(): SecurityLogEntry[] {
  try {
    const raw = localStorage.getItem(SECURITY_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function appendSecurityLog(action: string, details?: string) {
  try {
    const logs = getSecurityLogs();
    const newEntry: SecurityLogEntry = {
      id: `sec-${Date.now()}`,
      action,
      timestamp: new Date().toLocaleTimeString() + ' • ' + new Date().toLocaleDateString(),
      details,
    };
    localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify([newEntry, ...logs.slice(0, 30)]));
  } catch (err) {
    console.warn('Failed to record security audit log', err);
  }
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToPortfolio,
  showreels,
  graphics,
}) => {
  const { user, logout, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'videos' | 'shorts' | 'graphics' | 'site-copy' | 'inquiries' | 'github-sync' | 'security'
  >('videos');

  // Protect local edit session from background sync overwrites
  useEffect(() => {
    localStorage.setItem('zolepto_admin_editing_active', 'true');
    return () => {
      localStorage.removeItem('zolepto_admin_editing_active');
    };
  }, []);

  // Site Copy State
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Top Bar Quick Push to GitHub State
  const [isPushingTop, setIsPushingTop] = useState(false);
  const [topPushStatus, setTopPushStatus] = useState<string | null>(null);

  const hasPendingChanges = hasPortfolioChangesToPublish({ siteSettings, showreels, graphics });

  const handleTopPushLive = async () => {
    if (!hasPendingChanges) {
      setTopPushStatus('Up to Date');
      setTimeout(() => setTopPushStatus(null), 3000);
      return;
    }

    const cfg = getGitHubConfig();
    setIsPushingTop(true);
    setTopPushStatus('Publishing Live...');
    try {
      const res = await pushPortfolioToGitHub({ siteSettings, showreels, graphics }, cfg);
      if (res.noChanges) {
        setTopPushStatus('Up to Date');
      } else if (res.success) {
        setTopPushStatus('Live Worldwide!');
        appendSecurityLog('Published Live Globally', res.commitUrl || 'Success');
      } else {
        setTopPushStatus('Publish Issue');
      }
      setTimeout(() => setTopPushStatus(null), 3500);
    } catch (e: any) {
      setTopPushStatus('Failed');
      setTimeout(() => setTopPushStatus(null), 3000);
    } finally {
      setIsPushingTop(false);
    }
  };

  // Inquiries State
  const [inquiries, setInquiries] = useState<SubmittedBooking[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'reviewed' | 'contacted'>('all');
  const [copiedInquiryId, setCopiedInquiryId] = useState<string | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<SecurityLogEntry[]>([]);

  // Security Idle Timer (Auto-lock after 15 minutes of inactivity)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(900); // 15 mins in seconds
  const lastActivityRef = useRef(Date.now());

  // Edit Video Modal State
  const [editingVideo, setEditingVideo] = useState<VideoProject | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    client: '',
    category: 'commercial' as VideoCategory,
    categoryLabel: '',
    youtubeUrl: '',
    duration: '',
    year: '2026',
    role: 'Lead Editor',
    description: '',
    tags: '',
    metrics: '',
    thumbnailUrl: '',
  });
  const [videoFormStatus, setVideoFormStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Edit Graphic Modal State
  const [editingGraphic, setEditingGraphic] = useState<GraphicProject | null>(null);
  const [isAddingGraphic, setIsAddingGraphic] = useState(false);
  const [graphicFormData, setGraphicFormData] = useState({
    title: '',
    client: '',
    category: 'key-art' as GraphicCategory,
    categoryLabel: '',
    imageUrl: '',
    aspect: 'portrait' as 'portrait' | 'landscape' | 'square',
    year: '2026',
    description: '',
    tools: 'Photoshop',
  });
  const [graphicFile, setGraphicFile] = useState<File | null>(null);
  const [graphicPreviewUrl, setGraphicPreviewUrl] = useState<string | null>(null);
  const [detectedImgbbFormat, setDetectedImgbbFormat] = useState<string | null>(null);
  const [graphicFormStatus, setGraphicFormStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingGraphic, setIsSavingGraphic] = useState(false);

  // Search & Filters for management tables
  const [videoSearch, setVideoSearch] = useState('');
  const [shortSearch, setShortSearch] = useState('');
  const [graphicSearch, setGraphicSearch] = useState('');

  // Drag-and-drop hold-to-reorder state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [reorderStatus, setReorderStatus] = useState<string | null>(null);

  // 1. Subscribe to Inquiries
  useEffect(() => {
    const unsubscribe = subscribeToInquiries((items) => {
      setInquiries(items);
    });
    return unsubscribe;
  }, []);

  // 2. Subscribe to Site Copy Settings
  useEffect(() => {
    const unsubscribe = subscribeToSiteSettings((settings) => {
      setSiteSettings(settings);
    });
    return unsubscribe;
  }, []);

  // 3. Load Security Audit Logs
  useEffect(() => {
    setAuditLogs(getSecurityLogs());
  }, [activeTab]);

  // 4. Idle Security Lock Counter
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setSessionTimeLeft(900);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, 900 - elapsed);
      setSessionTimeLeft(remaining);

      if (remaining === 0) {
        appendSecurityLog('Session Auto-Locked (Idle Inactivity)', 'Idle timer reached 15 minutes');
        logout();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [logout]);

  const handleInstantLock = async () => {
    appendSecurityLog('Manual Admin Session Lock', 'User clicked lock admin');
    await logout();
  };

  // --- Video Handlers ---
  const handleOpenEditVideo = (video: VideoProject) => {
    setEditingVideo(video);
    setIsAddingVideo(false);
    const existingUrl = video.youtubeId
      ? `https://www.youtube.com/watch?v=${video.youtubeId}`
      : (video as any).youtubeUrl || video.embedUrl || '';
    const ytId = video.youtubeId || extractYouTubeId(existingUrl);
    const autoMaxres = ytId ? getYouTubeThumbnailUrl(ytId, 'maxres') : (video.thumbnailUrl || '');
    setVideoFormData({
      title: video.title || '',
      client: video.client || '',
      category: video.category || 'commercial',
      categoryLabel: video.categoryLabel || '',
      youtubeUrl: existingUrl,
      duration: video.duration || '',
      year: video.year || '2026',
      role: video.role || 'Lead Editor',
      description: video.description || '',
      tags: Array.isArray(video.tags) ? video.tags.join(', ') : '',
      metrics: video.metrics || '',
      thumbnailUrl: autoMaxres || video.thumbnailUrl || '',
    });
    setVideoFormStatus(null);
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setIsAddingVideo(true);
    setVideoFormData({
      title: '',
      client: '',
      category: 'commercial',
      categoryLabel: '',
      youtubeUrl: '',
      duration: '1:00',
      year: '2026',
      role: 'Lead Editor',
      description: '',
      tags: 'Editing, Pacing, Sound Design',
      metrics: '',
      thumbnailUrl: '',
    });
    setVideoFormStatus(null);
  };

  const handleOpenAddShort = () => {
    setEditingVideo(null);
    setIsAddingVideo(true);
    setVideoFormData({
      title: '',
      client: '',
      category: 'short-form',
      categoryLabel: 'Short-Form',
      youtubeUrl: '',
      duration: '0:30',
      year: '2026',
      role: 'Retention Edit & Hook',
      description: '',
      tags: 'Short-Form, Reels, TikTok, Viral',
      metrics: '',
      thumbnailUrl: '',
    });
    setVideoFormStatus(null);
  };

  // Reorder drop handlers
  const handleDropVideo = (targetId: string) => {
    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }
    reorderCategoryInVideos(showreels, (v) => !isShortFormVideo(v), draggedItemId, targetId);
    appendSecurityLog('Reordered Videos', `Moved project in order`);
    setReorderStatus('Video order updated');
    setTimeout(() => setReorderStatus(null), 2500);
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDropShort = (targetId: string) => {
    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }
    reorderCategoryInVideos(showreels, (v) => isShortFormVideo(v), draggedItemId, targetId);
    appendSecurityLog('Reordered Shorts', `Moved project in order`);
    setReorderStatus('Shorts order updated');
    setTimeout(() => setReorderStatus(null), 2500);
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDropGraphic = (targetId: string) => {
    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }
    reorderGraphicsList(graphics, draggedItemId, targetId);
    appendSecurityLog('Reordered Graphics', `Moved project in order`);
    setReorderStatus('Graphic design order updated');
    setTimeout(() => setReorderStatus(null), 2500);
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = videoFormData.title.trim();
    if (!title) {
      setVideoFormStatus({ type: 'error', text: 'Title is required' });
      return;
    }

    const inputUrl = videoFormData.youtubeUrl.trim();
    if (!editingVideo && !inputUrl) {
      setVideoFormStatus({ type: 'error', text: 'Video URL is required' });
      return;
    }

    const parsed = inputUrl ? parseVideoUrl(inputUrl) : null;
    if (inputUrl && !parsed?.embedUrl && !parsed?.videoId && !editingVideo) {
      setVideoFormStatus({
        type: 'error',
        text: 'Please enter a valid video link (YouTube, Shorts, IG Reels, TikTok, or FB Reels)',
      });
      return;
    }

    setIsSavingVideo(true);
    setVideoFormStatus(null);

    const inputCatLabel = videoFormData.categoryLabel.trim();
    const isShort = parsed
      ? (parsed.isShortForm || inputCatLabel.toLowerCase().includes('short') || videoFormData.category === 'short-form')
      : (editingVideo ? (editingVideo.aspectRatio === '9/16' || inputCatLabel.toLowerCase().includes('short') || videoFormData.category === 'short-form') : (inputCatLabel.toLowerCase().includes('short') || videoFormData.category === 'short-form'));

    const category: VideoCategory = isShort
      ? 'short-form'
      : (inputCatLabel.toLowerCase().includes('doc')
        ? 'documentary'
        : inputCatLabel.toLowerCase().includes('narrative')
        ? 'narrative'
        : inputCatLabel.toLowerCase().includes('motion')
        ? 'motion-graphics'
        : (videoFormData.category || 'commercial'));

    const resolvedCategoryLabel = inputCatLabel || (isShort ? 'Short-Form' : 'Commercial');

    const tagList = videoFormData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const ytId = parsed?.videoId || extractYouTubeId(inputUrl);
    const autoMaxresThumb = ytId ? getYouTubeThumbnailUrl(ytId, 'maxres') : null;
    const resolvedThumb =
      autoMaxresThumb ||
      (videoFormData.thumbnailUrl.trim() ? upgradeYouTubeThumbnailUrl(videoFormData.thumbnailUrl.trim()) : null) ||
      (parsed?.thumbnailUrl ? upgradeYouTubeThumbnailUrl(parsed.thumbnailUrl) : undefined);

    try {
      if (editingVideo) {
        await updateShowreel(editingVideo.id, {
          title,
          client: videoFormData.client.trim() || editingVideo.client || 'Client Project',
          category,
          categoryLabel: resolvedCategoryLabel,
          ...(inputUrl ? { youtubeUrl: inputUrl } : {}),
          aspectRatio: isShort ? '9/16' : '16/9',
          duration: videoFormData.duration.trim() || editingVideo.duration || (isShort ? '0:30' : '1:00'),
          year: videoFormData.year.trim() || editingVideo.year || '2026',
          role: videoFormData.role.trim() || editingVideo.role || (isShort ? 'Retention Edit & Hook' : 'Lead Editor'),
          description: videoFormData.description.trim(),
          tags: tagList.length > 0 ? tagList : (editingVideo.tags || (isShort ? ['Short-Form', 'Reels'] : ['Editing'])),
          metrics: videoFormData.metrics.trim(),
          thumbnailUrl: resolvedThumb,
        });
        appendSecurityLog(`Updated Video: ${title}`, `ID: ${editingVideo.id}`);
        setVideoFormStatus({ type: 'success', text: 'Video project updated and synchronized globally!' });
      } else {
        await addShowreel({
          title,
          client: videoFormData.client.trim() || 'Client Project',
          category,
          categoryLabel: resolvedCategoryLabel,
          youtubeUrl: inputUrl,
          duration: videoFormData.duration.trim() || (isShort ? '0:30' : '1:00'),
          description: videoFormData.description.trim(),
          role: videoFormData.role.trim() || (isShort ? 'Retention Edit & Hook' : 'Lead Editor'),
          tags: tagList.length > 0 ? tagList : (isShort ? ['Short-Form', 'Reels'] : ['Commercial', 'Editing']),
          thumbnailUrl: resolvedThumb,
        });
        appendSecurityLog(`Created New Video: ${title}`, 'Added to portfolio');
        setVideoFormStatus({ type: 'success', text: 'New video published and saved to portfolio!' });
      }

      setTimeout(() => {
        setEditingVideo(null);
        setIsAddingVideo(false);
      }, 900);
    } catch (err: any) {
      setVideoFormStatus({ type: 'error', text: err?.message || 'Failed to save video' });
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}" from the portfolio?`)) {
      await deleteShowreel(id);
      appendSecurityLog(`Deleted Video: ${title}`, `ID: ${id}`);
    }
  };

  // --- Graphic Handlers ---
  const handleOpenEditGraphic = (graphic: GraphicProject) => {
    setEditingGraphic(graphic);
    setIsAddingGraphic(false);
    setGraphicFormData({
      title: graphic.title,
      client: graphic.client,
      category: graphic.category,
      categoryLabel: graphic.categoryLabel || (graphic.category === 'thumbnails' ? 'Thumbnail' : graphic.category === 'key-art' ? 'Key-Art' : 'Poster'),
      imageUrl: graphic.imageUrl,
      aspect: graphic.aspect,
      year: graphic.year || '2026',
      description: graphic.description || '',
      tools: Array.isArray(graphic.tools) ? graphic.tools.join(', ') : 'Photoshop',
    });
    setGraphicFile(null);
    setGraphicPreviewUrl(graphic.imageUrl);
    setDetectedImgbbFormat(detectImgbbFormat(graphic.imageUrl));
    setGraphicFormStatus(null);
  };

  const handleOpenAddGraphic = () => {
    setEditingGraphic(null);
    setIsAddingGraphic(true);
    setGraphicFormData({
      title: '',
      client: '',
      category: 'key-art',
      categoryLabel: 'Key-Art',
      imageUrl: '',
      aspect: 'portrait',
      year: '2026',
      description: '',
      tools: 'Photoshop',
    });
    setGraphicFile(null);
    setGraphicPreviewUrl(null);
    setDetectedImgbbFormat(null);
    setGraphicFormStatus(null);
  };

  const handleGraphicUrlChange = async (value: string) => {
    const detected = detectImgbbFormat(value);
    setDetectedImgbbFormat(detected);

    const cleaned = cleanImageUrl(value);
    const targetUrl = cleaned || value;
    setGraphicFormData((prev) => ({ ...prev, imageUrl: targetUrl }));
    setGraphicPreviewUrl(targetUrl);

    // If it's an ImgBB viewer link (e.g. ibb.co/xyz), attempt automatic resolution
    if (value.includes('ibb.co') && !value.includes('i.ibb.co')) {
      try {
        const resolved = await resolveImgbbViewerUrl(value);
        if (resolved && resolved !== value) {
          setGraphicFormData((prev) => ({ ...prev, imageUrl: resolved }));
          setGraphicPreviewUrl(resolved);
        }
      } catch {}
    }
  };

  const handleGraphicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGraphicFile(file);
      setGraphicPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveGraphic = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = graphicFormData.title.trim();
    if (!title) {
      setGraphicFormStatus({ type: 'error', text: 'Title is required' });
      return;
    }
    if (!graphicFile && !graphicFormData.imageUrl && !graphicPreviewUrl && !editingGraphic) {
      setGraphicFormStatus({ type: 'error', text: 'Please provide an image file or image URL' });
      return;
    }

    setIsSavingGraphic(true);
    setGraphicFormStatus(null);

    const toolsList = graphicFormData.tools
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const inputImgUrl = graphicFormData.imageUrl?.trim() || '';
      const sanitizedImageUrl = cleanImageUrl(inputImgUrl) || inputImgUrl || (editingGraphic ? editingGraphic.imageUrl : '');

      const catLabel = graphicFormData.categoryLabel.trim() || 'Key-Art';
      const derivedCategory: GraphicCategory = catLabel.toLowerCase().includes('thumb')
        ? 'thumbnails'
        : catLabel.toLowerCase().includes('poster') || catLabel.toLowerCase().includes('art') || catLabel.toLowerCase().includes('key')
        ? 'key-art'
        : 'styleframes';

      if (editingGraphic) {
        await updateGraphicDesign(editingGraphic.id, {
          title,
          client: graphicFormData.client.trim() || editingGraphic.client || 'Studio Art',
          category: derivedCategory,
          categoryLabel: catLabel,
          imageUrl: sanitizedImageUrl,
          aspect: graphicFormData.aspect,
          year: graphicFormData.year.trim() || editingGraphic.year || '2026',
          description: graphicFormData.description.trim(),
          tools: toolsList.length > 0 ? toolsList : (editingGraphic.tools || ['Photoshop']),
          file: graphicFile,
        });
        appendSecurityLog(`Updated Graphic Design: ${title}`, `ID: ${editingGraphic.id}`);
        setGraphicFormStatus({ type: 'success', text: 'Graphic design updated and synchronized!' });
      } else {
        await addGraphicDesign({
          title,
          client: graphicFormData.client.trim() || 'Studio Art',
          category: derivedCategory,
          categoryLabel: catLabel,
          aspect: graphicFormData.aspect,
          description: graphicFormData.description.trim(),
          tools: toolsList.length > 0 ? toolsList : ['Photoshop'],
          imageUrl: sanitizedImageUrl,
          file: graphicFile,
        });
        appendSecurityLog(`Created New Graphic: ${title}`, 'Added to portfolio');
        setGraphicFormStatus({ type: 'success', text: 'Graphic design published and saved to portfolio!' });
      }

      setTimeout(() => {
        setEditingGraphic(null);
        setIsAddingGraphic(false);
      }, 900);
    } catch (err: any) {
      setGraphicFormStatus({ type: 'error', text: err?.message || 'Failed to save graphic design' });
    } finally {
      setIsSavingGraphic(false);
    }
  };

  const handleDeleteGraphic = async (id: string, title: string, imageUrl?: string) => {
    if (confirm(`Are you sure you want to remove graphic "${title}"?`)) {
      await deleteGraphicDesign(id, imageUrl);
      appendSecurityLog(`Deleted Graphic: ${title}`, `ID: ${id}`);
    }
  };

  // --- Site Copy Settings Handlers ---
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsStatus(null);
    try {
      const res = await updateSiteSettings(siteSettings);
      appendSecurityLog('Published Live Site Copy Changes', 'Saved successfully');
      setSettingsStatus({
        type: 'success',
        text: 'Live website copy saved and updated successfully!',
      });
      setTimeout(() => setSettingsStatus(null), 4000);
    } catch (err: any) {
      setSettingsStatus({ type: 'error', text: err?.message || 'Failed to update site copy' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // --- Inquiry Handlers ---
  const handleInquiryStatusChange = async (id: string, status: 'new' | 'reviewed' | 'contacted') => {
    await updateInquiryStatus(id, status);
    appendSecurityLog(`Updated Inquiry Status to ${status}`, `ID: ${id}`);
  };

  const handleDeleteInquiry = async (id: string, clientName: string) => {
    if (confirm(`Delete inquiry from ${clientName}?`)) {
      await deleteInquiry(id);
      appendSecurityLog(`Deleted Client Inquiry from ${clientName}`, `ID: ${id}`);
    }
  };

  const handleCopyInquiry = (inquiry: SubmittedBooking) => {
    const text = `Inquiry ${inquiry.id}\nName: ${inquiry.fullName}\nEmail: ${inquiry.email}\nScope: ${inquiry.projectType}\nBudget: ${inquiry.estimatedBudget}\nBrief: ${inquiry.brief}`;
    navigator.clipboard.writeText(text);
    setCopiedInquiryId(inquiry.id);
    setTimeout(() => setCopiedInquiryId(null), 2000);
  };

  // Video preview in editor
  const parsedVideoInput = parseVideoUrl(videoFormData.youtubeUrl);
  const editVideoId = parsedVideoInput.videoId || extractYouTubeId(videoFormData.youtubeUrl);
  const isFormShort =
    videoFormData.category === 'short-form' ||
    parsedVideoInput.isShortForm ||
    (editingVideo ? editingVideo.aspectRatio === '9/16' : false);
  const rawEditThumb =
    videoFormData.thumbnailUrl.trim() ||
    parsedVideoInput.thumbnailUrl ||
    (editVideoId ? getYouTubeThumbnailUrl(editVideoId, 'maxres') : null);
  const editVideoThumb = rawEditThumb ? upgradeYouTubeThumbnailUrl(rawEditThumb) : null;

  // Filter lists: separate horizontal videos from vertical shorts
  const horizontalVideos = showreels.filter((v) => !isShortFormVideo(v));
  const shortsVideos = showreels.filter((v) => isShortFormVideo(v));

  const filteredVideos = horizontalVideos.filter(
    (v) =>
      v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
      v.client.toLowerCase().includes(videoSearch.toLowerCase()) ||
      v.category.toLowerCase().includes(videoSearch.toLowerCase())
  );

  const filteredShorts = shortsVideos.filter(
    (v) =>
      v.title.toLowerCase().includes(shortSearch.toLowerCase()) ||
      v.client.toLowerCase().includes(shortSearch.toLowerCase()) ||
      v.category.toLowerCase().includes(shortSearch.toLowerCase())
  );

  const filteredGraphics = graphics.filter(
    (g) =>
      g.title.toLowerCase().includes(graphicSearch.toLowerCase()) ||
      g.client.toLowerCase().includes(graphicSearch.toLowerCase()) ||
      g.category.toLowerCase().includes(graphicSearch.toLowerCase())
  );

  const filteredInquiries = inquiries.filter((inq) => {
    if (inquiryFilter === 'all') return true;
    return (inq.status || 'new') === inquiryFilter;
  });

  const minutesLeft = Math.floor(sessionTimeLeft / 60);
  const secondsLeft = sessionTimeLeft % 60;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-body">
      {/* Backdoor Top Security Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              id="admin-back-btn"
              onClick={onBackToPortfolio}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit to Live Portfolio</span>
            </button>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-display font-bold text-sm tracking-tight text-zinc-900">
                Backdoor Content Manager
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold">
                Authorized Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Commit & Push Live to GitHub Button */}
            <button
              id="top-push-github-btn"
              type="button"
              onClick={handleTopPushLive}
              disabled={isPushingTop}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-2xs ${
                hasPendingChanges
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-200'
              }`}
              title={
                hasPendingChanges
                  ? 'Publish unsaved modifications live globally'
                  : 'No modifications detected. Current state is already identical to published version.'
              }
            >
              {isPushingTop ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : hasPendingChanges ? (
                <GitBranch className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <span>
                {topPushStatus ||
                  (isPushingTop
                    ? 'Publishing...'
                    : hasPendingChanges
                    ? 'Publish Changes'
                    : 'Up to Date')}
              </span>
            </button>

            {/* Session Countdown & Lock button */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-100 font-mono text-xs text-zinc-500">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Lock: {minutesLeft}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
              </span>
            </div>

            <button
              id="admin-lock-btn"
              onClick={handleInstantLock}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Backdoor Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-zinc-200 mb-8 scrollbar-none">
          <button
            id="tab-btn-videos"
            onClick={() => setActiveTab('videos')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'videos'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Videos ({horizontalVideos.length})</span>
          </button>

          <button
            id="tab-btn-shorts"
            onClick={() => setActiveTab('shorts')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'shorts'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-rose-500" />
            <span>Shorts ({shortsVideos.length})</span>
          </button>

          <button
            id="tab-btn-graphics"
            onClick={() => setActiveTab('graphics')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'graphics'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Graphic Design ({graphics.length})</span>
          </button>

          <button
            id="tab-btn-site-copy"
            onClick={() => setActiveTab('site-copy')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'site-copy'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Live Website Copy & Brand</span>
          </button>

          <button
            id="tab-btn-inquiries"
            onClick={() => setActiveTab('inquiries')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Inquiries ({inquiries.length})</span>
          </button>

          <button
            id="tab-btn-github-sync"
            onClick={() => setActiveTab('github-sync')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'github-sync'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
            }`}
          >
            <GitBranch className="w-4 h-4 text-emerald-600" />
            <span>GitHub & Vercel Sync</span>
          </button>

          <button
            id="tab-btn-security"
            onClick={() => setActiveTab('security')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Access</span>
          </button>
        </div>

        {/* TAB 1: VIDEOS MANAGER */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-900">
                  Video Projects & Commercial Cuts
                </h2>
                <p className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Manage, edit, or add video projects.</span>
                  <span className="text-zinc-300">•</span>
                  <span className="inline-flex items-center gap-1 text-zinc-700 font-mono font-medium bg-zinc-100 px-2 py-0.5 rounded">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-500" /> Hold & drag any card to reorder
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                />
                <button
                  id="add-video-btn"
                  onClick={handleOpenAddVideo}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Video</span>
                </button>
              </div>
            </div>

            {/* Video List Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', video.id);
                    setDraggedItemId(video.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverItemId !== video.id) setDragOverItemId(video.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverItemId === video.id) setDragOverItemId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropVideo(video.id);
                  }}
                  onDragEnd={() => {
                    setDraggedItemId(null);
                    setDragOverItemId(null);
                  }}
                  className={`rounded-2xl bg-white border border-zinc-200/90 overflow-hidden shadow-2xs flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-150 ${
                    draggedItemId === video.id
                      ? 'opacity-30 scale-[0.98] border-dashed border-zinc-400'
                      : ''
                  } ${
                    dragOverItemId === video.id
                      ? 'ring-2 ring-zinc-950 ring-offset-2 scale-[1.01]'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video bg-zinc-950 overflow-hidden">
                      <img
                        src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'}
                        alt={video.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) =>
                          handleThumbnailImageError(
                            e,
                            'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
                          )
                        }
                        onLoad={handleThumbnailImageLoad}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-mono text-white">
                          {video.categoryLabel || video.category}
                        </span>
                      </div>
                      <div
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white/80 hover:text-white"
                        title="Hold and drag anywhere to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-xs font-mono text-zinc-400">
                        <span>{video.client}</span>
                      </div>
                      <h3 className="font-display font-semibold text-base text-zinc-950 line-clamp-1">
                        {video.title}
                      </h3>
                      {Array.isArray(video.tags) && video.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {video.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-600 border border-zinc-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {video.description && (
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[150px]">
                      {video.role || 'Editor'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditVideo(video)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3 text-zinc-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id, video.title)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="py-16 text-center rounded-2xl bg-white border border-zinc-200/80 p-8">
                <Film className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-zinc-900">No videos found</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  {videoSearch ? 'Try clearing your search query.' : 'Add your first video project to showcase in your portfolio.'}
                </p>
                <button
                  onClick={handleOpenAddVideo}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Video</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHORTS & VERTICAL VIDEO MANAGER */}
        {activeTab === 'shorts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-zinc-900">
                    Vertical Shorts & Reels
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-mono font-semibold border border-rose-200">
                    9:16 Aspect
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Manage vertical cuts, YouTube Shorts, IG Reels, and TikToks.</span>
                  <span className="text-zinc-300">•</span>
                  <span className="inline-flex items-center gap-1 text-zinc-700 font-mono font-medium bg-zinc-100 px-2 py-0.5 rounded">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-500" /> Hold & drag any card to reorder
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search shorts..."
                  value={shortSearch}
                  onChange={(e) => setShortSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                />
                <button
                  id="add-short-btn"
                  onClick={handleOpenAddShort}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Short</span>
                </button>
              </div>
            </div>

            {/* Shorts Cards Grid (Vertical 9:16 Preview) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredShorts.map((short) => (
                <div
                  key={short.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', short.id);
                    setDraggedItemId(short.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverItemId !== short.id) setDragOverItemId(short.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverItemId === short.id) setDragOverItemId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropShort(short.id);
                  }}
                  onDragEnd={() => {
                    setDraggedItemId(null);
                    setDragOverItemId(null);
                  }}
                  className={`rounded-2xl bg-white border border-zinc-200/90 overflow-hidden shadow-2xs flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-150 ${
                    draggedItemId === short.id
                      ? 'opacity-30 scale-[0.98] border-dashed border-zinc-400'
                      : ''
                  } ${
                    dragOverItemId === short.id
                      ? 'ring-2 ring-zinc-950 ring-offset-2 scale-[1.01]'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Vertical 9:16 Aspect Thumbnail Container */}
                    <div className="relative w-full aspect-[9/16] bg-zinc-950 overflow-hidden">
                      <img
                        src={short.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'}
                        alt={short.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) =>
                          handleThumbnailImageError(
                            e,
                            'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
                          )
                        }
                        onLoad={handleThumbnailImageLoad}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                      
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-rose-600/90 backdrop-blur-xs text-[10px] font-mono text-white flex items-center gap-1">
                          <Smartphone className="w-2.5 h-2.5" />
                          <span>9:16</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-mono text-white">
                          {short.categoryLabel || short.category}
                        </span>
                      </div>

                      <div
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white/80 hover:text-white"
                        title="Hold and drag anywhere to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                        <span>{short.client}</span>
                        <span>{short.duration || '0:30'}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-display font-semibold text-sm text-zinc-950 line-clamp-2">
                        {short.title}
                      </h3>
                      {Array.isArray(short.tags) && short.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {short.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-600 border border-zinc-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {short.metrics && !short.metrics.toLowerCase().includes('view') && (
                        <div className="text-[11px] font-mono text-emerald-600 font-semibold truncate">
                          {short.metrics}
                        </div>
                      )}
                      {short.description && (
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {short.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[120px]">
                      {short.role || 'Short-Form Editor'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditVideo(short)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3 text-zinc-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(short.id, short.title)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete short"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredShorts.length === 0 && (
              <div className="py-16 text-center rounded-2xl bg-white border border-zinc-200/80 p-8">
                <Smartphone className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-zinc-900">No vertical shorts found</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  {shortSearch
                    ? 'Try clearing your search query.'
                    : 'Add YouTube Shorts, Instagram Reels, or TikTok vertical edits to showcase in your Shorts tab.'}
                </p>
                <button
                  onClick={handleOpenAddShort}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Short</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GRAPHIC DESIGN MANAGER */}
        {activeTab === 'graphics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-900">
                  Graphic Design & Key-Art Packaging
                </h2>
                <p className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Upload, replace, and edit visual assets, posters, thumbnails, and brand stills.</span>
                  <span className="text-zinc-300">•</span>
                  <span className="inline-flex items-center gap-1 text-zinc-700 font-mono font-medium bg-zinc-100 px-2 py-0.5 rounded">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-500" /> Hold & drag any card to reorder
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search graphics..."
                  value={graphicSearch}
                  onChange={(e) => setGraphicSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                />
                <button
                  id="add-graphic-btn"
                  onClick={handleOpenAddGraphic}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Graphic</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGraphics.map((graphic) => (
                <div
                  key={graphic.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', graphic.id);
                    setDraggedItemId(graphic.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverItemId !== graphic.id) setDragOverItemId(graphic.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverItemId === graphic.id) setDragOverItemId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropGraphic(graphic.id);
                  }}
                  onDragEnd={() => {
                    setDraggedItemId(null);
                    setDragOverItemId(null);
                  }}
                  className={`rounded-2xl bg-white border border-zinc-200/90 overflow-hidden shadow-2xs flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-150 ${
                    draggedItemId === graphic.id
                      ? 'opacity-30 scale-[0.98] border-dashed border-zinc-400'
                      : ''
                  } ${
                    dragOverItemId === graphic.id
                      ? 'ring-2 ring-zinc-950 ring-offset-2 scale-[1.01]'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="relative aspect-video bg-zinc-100 overflow-hidden">
                      <img
                        src={
                          graphic.imageUrl?.trim() ||
                          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={graphic.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-zinc-900">
                        {graphic.categoryLabel || graphic.category}
                      </span>
                      <div
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white/80 hover:text-white"
                        title="Hold and drag anywhere to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-xs font-mono text-zinc-400">
                        <span>{graphic.client}</span>
                      </div>
                      <h3 className="font-display font-semibold text-base text-zinc-950 line-clamp-1">
                        {graphic.title}
                      </h3>
                      {Array.isArray(graphic.tools) && graphic.tools.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {graphic.tools.map((tool, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-600 border border-zinc-200"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}
                      {graphic.description && (
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {graphic.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[150px]">
                      {graphic.tools.join(', ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditGraphic(graphic)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3 text-zinc-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGraphic(graphic.id, graphic.title, graphic.imageUrl)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete graphic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredGraphics.length === 0 && (
              <div className="py-16 text-center rounded-2xl bg-white border border-zinc-200/80 p-8">
                <ImageIcon className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-zinc-900">No graphic design items found</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  {graphicSearch ? 'Try clearing your search query.' : 'Add your first visual asset or key-art design.'}
                </p>
                <button
                  onClick={handleOpenAddGraphic}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Graphic</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LIVE WEBSITE COPY EDITOR */}
        {activeTab === 'site-copy' && (
          <VisualCopyEditor
            settings={siteSettings}
            onPublishToGitHub={async (updated) => {
              setSiteSettings(updated);
              setIsSavingSettings(true);
              setSettingsStatus(null);
              try {
                // 1. Update published settings & broadcast
                await updateSiteSettings(updated);
                appendSecurityLog('Saved Copy Changes in Visual Editor');

                // 2. Commit & Push directly to Global Cloud Store & GitHub
                const cfg = getGitHubConfig();

                setSettingsStatus({
                  type: 'success',
                  text: 'Publishing live worldwide to all clients...',
                });

                const pushRes = await pushPortfolioToGitHub(
                  { siteSettings: updated, showreels, graphics },
                  cfg
                );

                if (pushRes.success) {
                  appendSecurityLog('Published to Live Portfolio', pushRes.commitUrl);
                  setSettingsStatus({
                    type: 'success',
                    text: pushRes.message || 'Published live! Clients across all devices and browsers will now see the latest updates.',
                  });
                } else {
                  setSettingsStatus({
                    type: 'error',
                    text: `Publish error: ${pushRes.message || 'Unable to propagate changes'}`,
                  });
                }
              } catch (err: any) {
                setSettingsStatus({
                  type: 'error',
                  text: err.message || 'Failed to publish changes.',
                });
              } finally {
                setIsSavingSettings(false);
              }
            }}
            isPublishing={isSavingSettings}
            status={settingsStatus}
          />
        )}

        {/* TAB 4: CLIENT INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-900">
                  Client Project Inquiries & Briefs
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Prospective clients and creators requesting consultations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(['all', 'new', 'reviewed', 'contacted'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setInquiryFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                      inquiryFilter === filter
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Multi-Channel Intake Banner */}
            <div className="p-4 rounded-2xl bg-zinc-900 text-white text-xs flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-zinc-100">Multi-Channel Intake & Global Cloud Vault Active</span>
                <span className="text-zinc-300">
                  Client inquiries are saved to your real-time cloud vault, dispatched across email and configured webhooks (Discord/Slack), and synced directly into this dashboard across all your devices.
                </span>
              </div>
            </div>

            {filteredInquiries.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-zinc-200 text-zinc-500 text-xs font-mono">
                No inquiries matching filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-zinc-900">
                            {inq.fullName}
                          </span>
                          <span className="text-xs font-mono text-zinc-400">({inq.email})</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                              inq.status === 'contacted'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : inq.status === 'reviewed'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inq.status || 'new'}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-zinc-400 mt-0.5">
                          ID: {inq.id} • {inq.submittedAt}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`mailto:${encodeURIComponent(inq.email)}?subject=${encodeURIComponent(`Re: Project Inquiry [${inq.id}] — Zolepto`)}&body=${encodeURIComponent(`Hi ${inq.fullName},\n\nThank you for reaching out regarding your project: ${inq.projectType}.\n\nBest regards,\nZolepto`)}`}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Reply to client via email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </a>

                        <select
                          value={inq.status || 'new'}
                          onChange={(e) =>
                            handleInquiryStatusChange(inq.id, e.target.value as any)
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-800"
                        >
                          <option value="new">Mark New</option>
                          <option value="reviewed">Mark Reviewed</option>
                          <option value="contacted">Mark Contacted</option>
                        </select>

                        <button
                          onClick={() => handleCopyInquiry(inq)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"
                          title="Copy summary"
                        >
                          {copiedInquiryId === inq.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteInquiry(inq.id, inq.fullName)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-zinc-400 block">PROJECT TYPE:</span>
                        <span className="text-zinc-900 font-semibold">{inq.projectType}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block">ESTIMATED BUDGET:</span>
                        <span className="text-zinc-900 font-semibold">{inq.estimatedBudget || 'Flexible'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block">LINKS / ASSETS:</span>
                        <span className="text-zinc-900 truncate block">{inq.links || 'None'}</span>
                      </div>
                    </div>

                    {inq.brief && (
                      <div className="pt-2 text-xs text-zinc-700 bg-zinc-50/80 p-3 rounded-xl border border-zinc-100 font-normal leading-relaxed">
                        {inq.brief}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: GITHUB AUTO-COMMIT & VERCEL SYNC */}
        {activeTab === 'github-sync' && (
          <GitHubSyncTab
            siteSettings={siteSettings}
            showreels={showreels}
            graphics={graphics}
            onCommitSuccess={(commitUrl) =>
              appendSecurityLog('GitHub Auto-Commit Live', commitUrl)
            }
          />
        )}

        {/* TAB 6: SECURITY & HARDENED CREDENTIALS */}
        {activeTab === 'security' && (
          <SecurityTab
            auditLogs={auditLogs}
            onRefreshLogs={() => setAuditLogs(getSecurityLogs())}
          />
        )}
      </div>

      {/* MODAL: EDIT / ADD SHOWREEL */}
      {(editingVideo || isAddingVideo) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => {
            setEditingVideo(null);
            setIsAddingVideo(false);
          }}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h3 className="font-display font-bold text-xl text-zinc-950">
                  {editingVideo ? `Edit Video: ${editingVideo.title}` : 'Add New Video'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Metadata, YouTube video sync, and tags
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setIsAddingVideo(false);
                }}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {videoFormStatus && (
              <div
                className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  videoFormStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {videoFormStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{videoFormStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveVideo} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={videoFormData.title}
                    onChange={(e) =>
                      setVideoFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g. Nike — Momentum & Velocity"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Client / Brand Name
                  </label>
                  <input
                    type="text"
                    value={videoFormData.client}
                    onChange={(e) =>
                      setVideoFormData((prev) => ({ ...prev, client: e.target.value }))
                    }
                    placeholder="e.g. Nike Global"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Video Link (YouTube, Shorts, IG Reels, TikTok, FB Reels) *
                </label>
                <input
                  type="text"
                  required
                  value={videoFormData.youtubeUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parsed = parseVideoUrl(val);
                    const ytId = parsed.videoId || extractYouTubeId(val);
                    const autoMaxres = ytId ? getYouTubeThumbnailUrl(ytId, 'maxres') : (parsed.thumbnailUrl || '');
                    setVideoFormData((prev) => ({
                      ...prev,
                      youtubeUrl: val,
                      thumbnailUrl: autoMaxres ? upgradeYouTubeThumbnailUrl(autoMaxres) : prev.thumbnailUrl,
                      ...(parsed.isShortForm && (!prev.categoryLabel || prev.categoryLabel === 'Commercial')
                        ? { category: 'short-form' as VideoCategory, categoryLabel: 'Short-Form' }
                        : {}),
                    }));
                  }}
                  placeholder="https://youtube.com/shorts/... or tiktok.com/@... or instagram.com/reel/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Thumbnail Image URL (Auto-Detected in 1080p/720p HD, or Custom)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={videoFormData.thumbnailUrl}
                    onChange={(e) =>
                      setVideoFormData((prev) => ({ ...prev, thumbnailUrl: e.target.value }))
                    }
                    placeholder={editVideoThumb || 'https://i.ytimg.com/vi/.../maxresdefault.jpg'}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 font-mono"
                  />
                  {editVideoId && (
                    <button
                      type="button"
                      onClick={() => {
                        const maxres = getYouTubeThumbnailUrl(editVideoId, 'maxres');
                        setVideoFormData((prev) => ({ ...prev, thumbnailUrl: maxres }));
                      }}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-mono shrink-0 transition-colors"
                      title="Fetch maximum resolution 1280x720 HD thumbnail"
                    >
                      Use Maxres HD
                    </button>
                  )}
                </div>

                {editVideoThumb && (
                  <div className="mt-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3.5 text-white">
                    {/* Fixed aspect ratio preview container with zero white space */}
                    <div
                      className={`relative bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-zinc-700/80 shadow-inner ${
                        isFormShort ? 'w-14 aspect-[9/16]' : 'w-28 aspect-video'
                      }`}
                    >
                      <img
                        src={editVideoThumb}
                        alt="Thumbnail preview"
                        onError={(e) => handleThumbnailImageError(e)}
                        onLoad={handleThumbnailImageLoad}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[9px] text-white">
                        {isFormShort ? '9:16' : '16:9'}
                      </div>
                    </div>

                    <div className="text-xs font-mono text-zinc-300 flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white">
                          {parsedVideoInput.platformLabel || (isFormShort ? 'Short-Form' : 'Video')}
                        </span>
                        {isFormShort ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]">
                            <Smartphone className="w-2.5 h-2.5" />
                            Vertical 9:16
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px]">
                            16:9 Landscape
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                          HD Maxres
                        </span>
                      </div>
                      <div className="text-zinc-400 text-[11px] truncate">
                        {editVideoId ? `YouTube ID: ${editVideoId}` : 'Embed & Thumbnail Synced'}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {isFormShort
                          ? 'Vertical fill enabled: 100% card width coverage without white borders.'
                          : 'Pristine 1280x720 resolution with zero pixelation.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Category Label
                </label>
                <input
                  type="text"
                  value={videoFormData.categoryLabel}
                  onChange={(e) =>
                    setVideoFormData((prev) => ({ ...prev, categoryLabel: e.target.value }))
                  }
                  placeholder={isFormShort ? 'e.g. Shorts' : 'e.g. Commercial'}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={videoFormData.role}
                    onChange={(e) =>
                      setVideoFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    placeholder="e.g. Lead Editor & Colorist"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={videoFormData.tags}
                    onChange={(e) =>
                      setVideoFormData((prev) => ({ ...prev, tags: e.target.value }))
                    }
                    placeholder="Pacing, Sound Design, Kinetic"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Project Description
                </label>
                <textarea
                  rows={3}
                  value={videoFormData.description}
                  onChange={(e) =>
                    setVideoFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Summary of creative approach, pacing, storytelling..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingVideo(null);
                    setIsAddingVideo(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingVideo}
                  className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSavingVideo ? 'Saving...' : editingVideo ? 'Save Changes' : 'Publish Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD GRAPHIC */}
      {(editingGraphic || isAddingGraphic) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => {
            setEditingGraphic(null);
            setIsAddingGraphic(false);
          }}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h3 className="font-display font-bold text-xl text-zinc-950">
                  {editingGraphic ? `Edit Graphic: ${editingGraphic.title}` : 'Add New Graphic Asset'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Upload file or enter image link
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingGraphic(null);
                  setIsAddingGraphic(false);
                }}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {graphicFormStatus && (
              <div
                className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  graphicFormStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {graphicFormStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{graphicFormStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveGraphic} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Design Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={graphicFormData.title}
                    onChange={(e) =>
                      setGraphicFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g. Cyberpunk Key Art"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Client / Publication
                  </label>
                  <input
                    type="text"
                    value={graphicFormData.client}
                    onChange={(e) =>
                      setGraphicFormData((prev) => ({ ...prev, client: e.target.value }))
                    }
                    placeholder="e.g. Studio Art"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              {/* Image upload / URL */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-700">
                  Graphic Image Asset *
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGraphicFileChange}
                      className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                    />
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="text-[11px] font-mono text-zinc-500">
                        Or paste direct link / ImgBB code:
                      </div>
                      {detectedImgbbFormat && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{detectedImgbbFormat}</span>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={graphicFormData.imageUrl}
                      onChange={(e) => handleGraphicUrlChange(e.target.value)}
                      placeholder="Paste ImgBB link, HTML code, BBCode, Viewer link, or Embed code..."
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900 resize-none leading-relaxed"
                    />
                    <p className="text-[11px] text-zinc-400 leading-normal">
                      Full support for ImgBB codes: Embed codes, Viewer links, Direct links, HTML full/thumb linked, and BBCode full/thumb linked (thumbnails automatically upgraded to full-res).
                    </p>
                  </div>

                  {graphicPreviewUrl && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                      <img
                        src={graphicPreviewUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Category Label
                  </label>
                  <input
                    type="text"
                    value={graphicFormData.categoryLabel}
                    onChange={(e) =>
                      setGraphicFormData((prev) => ({
                        ...prev,
                        categoryLabel: e.target.value,
                      }))
                    }
                    placeholder="e.g. Key-Art, Thumbnail, Poster"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={graphicFormData.aspect}
                    onChange={(e) =>
                      setGraphicFormData((prev) => ({
                        ...prev,
                        aspect: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  >
                    <option value="portrait">Portrait (Posters)</option>
                    <option value="landscape">Landscape (Thumbnails)</option>
                    <option value="square">Square</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Tags / Tools (comma separated)
                  </label>
                  <input
                    type="text"
                    value={graphicFormData.tools}
                    onChange={(e) =>
                      setGraphicFormData((prev) => ({ ...prev, tools: e.target.value }))
                    }
                    placeholder="Photoshop, Blender"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={graphicFormData.description}
                  onChange={(e) =>
                    setGraphicFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Concept, typography, and visual treatment details..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGraphic(null);
                    setIsAddingGraphic(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingGraphic}
                  className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSavingGraphic ? 'Saving...' : editingGraphic ? 'Save Changes' : 'Publish Graphic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reorder Status Notification */}
      {reorderStatus && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-zinc-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{reorderStatus}</span>
        </div>
      )}
    </div>
  );
};
