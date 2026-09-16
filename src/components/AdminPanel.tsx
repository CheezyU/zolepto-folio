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
import { extractYouTubeId, buildYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../lib/youtube';
import {
  addShowreel,
  updateShowreel,
  deleteShowreel,
  addGraphicDesign,
  updateGraphicDesign,
  deleteGraphicDesign,
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
    'showreels' | 'graphics' | 'site-copy' | 'inquiries' | 'security'
  >('showreels');

  // Inquiries State
  const [inquiries, setInquiries] = useState<SubmittedBooking[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'reviewed' | 'contacted'>('all');
  const [copiedInquiryId, setCopiedInquiryId] = useState<string | null>(null);

  // Site Copy State
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
  const [graphicFormStatus, setGraphicFormStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingGraphic, setIsSavingGraphic] = useState(false);

  // Search & Filters for management tables
  const [videoSearch, setVideoSearch] = useState('');
  const [graphicSearch, setGraphicSearch] = useState('');

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

  // --- Showreel Handlers ---
  const handleOpenEditVideo = (video: VideoProject) => {
    setEditingVideo(video);
    setIsAddingVideo(false);
    setVideoFormData({
      title: video.title,
      client: video.client,
      category: video.category,
      categoryLabel: video.categoryLabel || '',
      youtubeUrl: video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : '',
      duration: video.duration || '',
      year: video.year || '2026',
      role: video.role || 'Lead Editor',
      description: video.description || '',
      tags: Array.isArray(video.tags) ? video.tags.join(', ') : '',
      metrics: video.metrics || '',
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
    });
    setVideoFormStatus(null);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormData.title.trim() || !videoFormData.youtubeUrl.trim()) {
      setVideoFormStatus({ type: 'error', text: 'Title and YouTube URL are required' });
      return;
    }

    const extracted = extractYouTubeId(videoFormData.youtubeUrl);
    if (!extracted) {
      setVideoFormStatus({ type: 'error', text: 'Please enter a valid YouTube video link or ID' });
      return;
    }

    setIsSavingVideo(true);
    setVideoFormStatus(null);

    const tagList = videoFormData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingVideo) {
        await updateShowreel(editingVideo.id, {
          title: videoFormData.title.trim(),
          client: videoFormData.client.trim() || 'Client Project',
          category: videoFormData.category,
          categoryLabel: videoFormData.categoryLabel.trim() || undefined,
          youtubeUrl: videoFormData.youtubeUrl.trim(),
          duration: videoFormData.duration.trim() || '1:00',
          year: videoFormData.year.trim() || '2026',
          role: videoFormData.role.trim() || 'Lead Editor',
          description: videoFormData.description.trim(),
          tags: tagList.length > 0 ? tagList : ['Editing'],
          metrics: videoFormData.metrics.trim(),
        });
        appendSecurityLog(`Updated Showreel: ${videoFormData.title}`, `ID: ${editingVideo.id}`);
        setVideoFormStatus({ type: 'success', text: 'Showreel updated and synchronized globally!' });
      } else {
        await addShowreel({
          title: videoFormData.title.trim(),
          client: videoFormData.client.trim() || 'Client Project',
          category: videoFormData.category,
          youtubeUrl: videoFormData.youtubeUrl.trim(),
          duration: videoFormData.duration.trim() || '1:00',
          description: videoFormData.description.trim(),
        });
        appendSecurityLog(`Created New Showreel: ${videoFormData.title}`, 'Added to portfolio');
        setVideoFormStatus({ type: 'success', text: 'New showreel published and saved to portfolio!' });
      }

      setTimeout(() => {
        setEditingVideo(null);
        setIsAddingVideo(false);
      }, 900);
    } catch (err: any) {
      setVideoFormStatus({ type: 'error', text: err?.message || 'Failed to save showreel' });
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}" from the portfolio?`)) {
      await deleteShowreel(id);
      appendSecurityLog(`Deleted Showreel: ${title}`, `ID: ${id}`);
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
      categoryLabel: graphic.categoryLabel || '',
      imageUrl: graphic.imageUrl,
      aspect: graphic.aspect,
      year: graphic.year || '2026',
      description: graphic.description || '',
      tools: Array.isArray(graphic.tools) ? graphic.tools.join(', ') : 'Photoshop',
    });
    setGraphicFile(null);
    setGraphicPreviewUrl(graphic.imageUrl);
    setGraphicFormStatus(null);
  };

  const handleOpenAddGraphic = () => {
    setEditingGraphic(null);
    setIsAddingGraphic(true);
    setGraphicFormData({
      title: '',
      client: '',
      category: 'key-art',
      categoryLabel: '',
      imageUrl: '',
      aspect: 'portrait',
      year: '2026',
      description: '',
      tools: 'Photoshop',
    });
    setGraphicFile(null);
    setGraphicPreviewUrl(null);
    setGraphicFormStatus(null);
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
    if (!graphicFormData.title.trim()) {
      setGraphicFormStatus({ type: 'error', text: 'Title is required' });
      return;
    }
    if (!graphicFile && !graphicFormData.imageUrl && !graphicPreviewUrl) {
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
      if (editingGraphic) {
        await updateGraphicDesign(editingGraphic.id, {
          title: graphicFormData.title.trim(),
          client: graphicFormData.client.trim() || 'Studio Art',
          category: graphicFormData.category,
          categoryLabel: graphicFormData.categoryLabel.trim() || undefined,
          imageUrl: graphicFormData.imageUrl,
          aspect: graphicFormData.aspect,
          year: graphicFormData.year.trim() || '2026',
          description: graphicFormData.description.trim(),
          tools: toolsList.length > 0 ? toolsList : ['Photoshop'],
          file: graphicFile,
        });
        appendSecurityLog(`Updated Graphic Design: ${graphicFormData.title}`, `ID: ${editingGraphic.id}`);
        setGraphicFormStatus({ type: 'success', text: 'Graphic design updated and synchronized!' });
      } else {
        await addGraphicDesign({
          title: graphicFormData.title.trim(),
          client: graphicFormData.client.trim() || 'Studio Art',
          category: graphicFormData.category,
          categoryLabel: graphicFormData.categoryLabel.trim() || undefined,
          aspect: graphicFormData.aspect,
          description: graphicFormData.description.trim(),
          tools: toolsList.length > 0 ? toolsList : ['Photoshop'],
          imageUrl: graphicFormData.imageUrl,
          file: graphicFile,
        });
        appendSecurityLog(`Created New Graphic: ${graphicFormData.title}`, 'Added to portfolio');
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
  const editVideoId = extractYouTubeId(videoFormData.youtubeUrl);
  const editVideoThumb = editVideoId ? getYouTubeThumbnailUrl(editVideoId) : null;

  // Filter lists
  const filteredVideos = showreels.filter(
    (v) =>
      v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
      v.client.toLowerCase().includes(videoSearch.toLowerCase()) ||
      v.category.toLowerCase().includes(videoSearch.toLowerCase())
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
            id="tab-btn-showreels"
            onClick={() => setActiveTab('showreels')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'showreels'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Showreels ({showreels.length})</span>
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
            <span>Live Website Copy Editor</span>
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
            id="tab-btn-security"
            onClick={() => setActiveTab('security')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Cloud Status</span>
          </button>
        </div>

        {/* TAB 1: SHOWREELS MANAGER */}
        {activeTab === 'showreels' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-900">
                  Video Showreels & Commercial Cuts
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Manage, edit, or add projects. Changes update seamlessly across your portfolio.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search showreels..."
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                />
                <button
                  id="add-showreel-btn"
                  onClick={handleOpenAddVideo}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Showreel</span>
                </button>
              </div>
            </div>

            {/* Video List Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="rounded-2xl bg-white border border-zinc-200/90 overflow-hidden shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-zinc-100 overflow-hidden">
                      <img
                        src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-mono text-white">
                        {video.categoryLabel || video.category}
                      </span>
                      {video.duration && (
                        <span className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-white">
                          {video.duration}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                        <span>{video.client}</span>
                        <span>{video.year}</span>
                      </div>
                      <h3 className="font-display font-semibold text-base text-zinc-950 line-clamp-1">
                        {video.title}
                      </h3>
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
          </div>
        )}

        {/* TAB 2: GRAPHIC DESIGN MANAGER */}
        {activeTab === 'graphics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-900">
                  Graphic Design & Key-Art Packaging
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Upload, replace, and edit visual assets, posters, thumbnails, and brand stills.
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
                  className="rounded-2xl bg-white border border-zinc-200/90 overflow-hidden shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video bg-zinc-100 overflow-hidden">
                      <img
                        src={graphic.imageUrl}
                        alt={graphic.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-zinc-900">
                        {graphic.categoryLabel || graphic.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                        <span>{graphic.client}</span>
                        <span>{graphic.year}</span>
                      </div>
                      <h3 className="font-display font-semibold text-base text-zinc-950 line-clamp-1">
                        {graphic.title}
                      </h3>
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
          </div>
        )}

        {/* TAB 3: LIVE WEBSITE COPY EDITOR */}
        {activeTab === 'site-copy' && (
          <div className="max-w-4xl space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-zinc-900">
                Live Website Copy & Brand Editor
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Directly edit headlines, studio bio, availability status, and contact information. All updates persist across devices globally.
              </p>
            </div>

            {settingsStatus && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                  settingsStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {settingsStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{settingsStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveSiteSettings} className="space-y-8">
              {/* Hero Section Copy */}
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-4">
                <h3 className="font-display font-semibold text-base text-zinc-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-600" />
                  <span>Hero Section Header</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Main Headline (Line 1)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.heroTitleLine1}
                      onChange={(e) =>
                        setSiteSettings((prev) => ({ ...prev, heroTitleLine1: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Secondary Headline (Line 2)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.heroTitleLine2}
                      onChange={(e) =>
                        setSiteSettings((prev) => ({ ...prev, heroTitleLine2: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Hero Narrative Subtitle
                  </label>
                  <textarea
                    rows={3}
                    value={siteSettings.heroSubtitle}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({ ...prev, heroSubtitle: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
                      <span>Availability Status Pill</span>
                      <span className="text-[10px] font-mono text-zinc-400">Live Hero Badge</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Available for incoming projects!"
                      value={siteSettings.availabilityStatus}
                      onChange={(e) =>
                        setSiteSettings((prev) => ({ ...prev, availabilityStatus: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Controls the glowing green availability pill displayed at the top of the home page.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Direct Contact Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) =>
                        setSiteSettings((prev) => ({ ...prev, contactEmail: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* About Section Copy */}
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-4">
                <h3 className="font-display font-semibold text-base text-zinc-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-600" />
                  <span>About & Philosophy Story</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Philosophy Quote
                  </label>
                  <textarea
                    rows={2}
                    value={siteSettings.aboutQuote}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({ ...prev, aboutQuote: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Bio Paragraph 1 (Background & Timeline Craft)
                  </label>
                  <textarea
                    rows={3}
                    value={siteSettings.aboutBio1}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({ ...prev, aboutBio1: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Bio Paragraph 2 (1-on-1 Collaboration & Philosophy)
                  </label>
                  <textarea
                    rows={3}
                    value={siteSettings.aboutBio2}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({ ...prev, aboutBio2: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSavingSettings ? 'Publishing to Cloud...' : 'Publish Live Website Changes'}
                </button>
              </div>
            </form>
          </div>
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

                      <div className="flex items-center gap-2">
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

        {/* TAB 5: SECURITY AUDIT & STATUS */}
        {activeTab === 'security' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-zinc-900">
                Security & Cloud Architecture
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Backdoor authentication, security rules audit trail, and database persistence status.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-zinc-200">
                <span className="text-[11px] font-mono text-zinc-400 block">ACCESS CONTROL</span>
                <p className="text-base font-bold text-zinc-900 mt-1">Authorized Admin</p>
                <p className="text-xs text-zinc-500 mt-0.5">{user?.email || 'zolepto@gmail.com'}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-zinc-200">
                <span className="text-[11px] font-mono text-zinc-400 block">DEPLOYMENT TARGET</span>
                <p className="text-base font-bold text-emerald-600 mt-1">
                  GitHub + Vercel
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">High-performance production architecture</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-zinc-200">
                <span className="text-[11px] font-mono text-zinc-400 block">AUTO-LOCK SECURITY</span>
                <p className="text-base font-bold text-zinc-900 mt-1">15 Min Idle Guard</p>
                <p className="text-xs text-zinc-500 mt-0.5">Locks immediately on inactivity</p>
              </div>
            </div>

            {/* Security Audit Trail Table */}
            <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-base text-zinc-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Security Audit Log (Recent Operations)</span>
                </h3>
                <button
                  onClick={() => setAuditLogs(getSecurityLogs())}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900"
                  title="Refresh logs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {auditLogs.length === 0 ? (
                <p className="text-xs font-mono text-zinc-400">No actions recorded yet.</p>
              ) : (
                <div className="divide-y divide-zinc-100 max-h-96 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-zinc-900">{log.action}</span>
                        {log.details && (
                          <span className="text-zinc-400 ml-2 font-mono text-[11px]">
                            ({log.details})
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-zinc-400 text-[11px] shrink-0">
                        {log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
                  {editingVideo ? `Edit Showreel: ${editingVideo.title}` : 'Add New Showreel'}
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
                  YouTube Video Link or ID *
                </label>
                <input
                  type="text"
                  required
                  value={videoFormData.youtubeUrl}
                  onChange={(e) =>
                    setVideoFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))
                  }
                  placeholder="https://www.youtube.com/watch?v=... or ID"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
                {editVideoThumb && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-zinc-50 border border-zinc-200">
                    <img
                      src={editVideoThumb}
                      alt="Thumbnail preview"
                      className="w-20 h-12 object-cover rounded-lg"
                    />
                    <div className="text-[11px] font-mono text-zinc-500">
                      Detected Video ID: <span className="text-zinc-900 font-bold">{editVideoId}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Category
                  </label>
                  <select
                    value={videoFormData.category}
                    onChange={(e) =>
                      setVideoFormData((prev) => ({
                        ...prev,
                        category: e.target.value as VideoCategory,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  >
                    <option value="commercial">Commercial</option>
                    <option value="documentary">Documentary</option>
                    <option value="short-form">Short-Form</option>
                    <option value="narrative">Narrative</option>
                    <option value="motion-graphics">Motion Graphics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Category Label (Display)
                  </label>
                  <input
                    type="text"
                    value={videoFormData.categoryLabel}
                    onChange={(e) =>
                      setVideoFormData((prev) => ({ ...prev, categoryLabel: e.target.value }))
                    }
                    placeholder="e.g. Commercial"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Runtime Duration
                  </label>
                  <input
                    type="text"
                    value={videoFormData.duration}
                    onChange={(e) =>
                      setVideoFormData((prev) => ({ ...prev, duration: e.target.value }))
                    }
                    placeholder="e.g. 1:15"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>
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
                  {isSavingVideo ? 'Saving...' : editingVideo ? 'Save Changes' : 'Publish Showreel'}
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
                    <div className="text-[11px] font-mono text-zinc-400">or provide image URL:</div>
                    <input
                      type="url"
                      value={graphicFormData.imageUrl}
                      onChange={(e) => {
                        setGraphicFormData((prev) => ({ ...prev, imageUrl: e.target.value }));
                        setGraphicPreviewUrl(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  {graphicPreviewUrl && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                      <img
                        src={graphicPreviewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Category
                  </label>
                  <select
                    value={graphicFormData.category}
                    onChange={(e) =>
                      setGraphicFormData((prev) => ({
                        ...prev,
                        category: e.target.value as GraphicCategory,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  >
                    <option value="key-art">Key Art</option>
                    <option value="styleframe">Styleframe</option>
                    <option value="thumbnail">Thumbnail</option>
                    <option value="typography">Typography</option>
                    <option value="poster">Poster</option>
                  </select>
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
                    Tools Used
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
    </div>
  );
};
