import React, { useState } from 'react';
import {
  GitBranch,
  Upload,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  Info,
  Check,
  Copy,
} from 'lucide-react';
import {
  GitHubSyncConfig,
  getGitHubConfig,
  saveGitHubConfig,
  testGitHubConnection,
  pushPortfolioToGitHub,
  getLastCommitInfo,
  hasPortfolioChangesToPublish,
} from '../../services/githubSyncService';
import { SiteSettings, VideoProject, GraphicProject } from '../../types';

interface GitHubSyncTabProps {
  siteSettings: SiteSettings;
  showreels: VideoProject[];
  graphics: GraphicProject[];
  onCommitSuccess?: (commitUrl: string) => void;
}

export const GitHubSyncTab: React.FC<GitHubSyncTabProps> = ({
  siteSettings,
  showreels,
  graphics,
  onCommitSuccess,
}) => {
  const [config, setConfig] = useState<GitHubSyncConfig>(getGitHubConfig());
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message: string;
    commitUrl?: string;
  } | null>(null);
  const [lastCommit, setLastCommit] = useState(getLastCommitInfo());
  const [copiedToken, setCopiedToken] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveGitHubConfig(config);
    setTestResult({ success: true, message: 'Settings saved to browser vault!' });
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGitHubConnection(config);
      setTestResult(res);
      if (res.success) {
        saveGitHubConfig(config);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const hasChanges = hasPortfolioChangesToPublish({ siteSettings, showreels, graphics });

  const handlePushLive = async () => {
    if (!hasChanges) {
      setPushResult({
        success: true,
        message: 'No changes detected. Your live portfolio already matches current settings. Edit items to publish.',
      });
      return;
    }

    if (!config.token.trim() || !config.owner.trim() || !config.repo.trim()) {
      setPushResult({
        success: false,
        message: 'Please fill in your GitHub Token, Username, and Repository Name below before pushing.',
      });
      return;
    }

    setIsPushing(true);
    setPushResult(null);
    try {
      // Save config first
      saveGitHubConfig(config);

      const res = await pushPortfolioToGitHub(
        { siteSettings, showreels, graphics },
        config
      );

      setPushResult(res);
      if (res.success) {
        setLastCommit(getLastCommitInfo());
        if (res.commitUrl && onCommitSuccess) {
          onCommitSuccess(res.commitUrl);
        }
      }
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in">
      {/* Top Banner: One-Click Push Live */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl space-y-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-emerald-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>GitHub API Auto-Commit (Method A)</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Push Portfolio Live to GitHub & Vercel
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Commits all current site copy, video projects, and graphic key-art directly to{' '}
              <code className="text-zinc-300 font-mono">public/content.json</code> on your GitHub repository.
              Vercel deploys changes live in seconds!
            </p>
          </div>

          <button
            id="push-to-github-btn"
            type="button"
            onClick={handlePushLive}
            disabled={isPushing}
            className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg shrink-0 ${
              isPushing
                ? 'bg-zinc-800 text-zinc-400 cursor-wait'
                : hasChanges
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-900/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
          >
            {isPushing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Committing to GitHub...</span>
              </>
            ) : hasChanges ? (
              <>
                <Upload className="w-4 h-4 text-zinc-950" />
                <span>Commit & Push Live</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Up to Date (No Changes)</span>
              </>
            )}
          </button>
        </div>

        {/* Live Push Status Message */}
        {pushResult && (
          <div
            id="github-push-result"
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              pushResult.success
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
                : 'bg-rose-950/60 border-rose-800/80 text-rose-200'
            }`}
          >
            {pushResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-semibold">{pushResult.message}</p>
              {pushResult.commitUrl && (
                <a
                  href={pushResult.commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:underline font-mono"
                >
                  <span>View Commit on GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Last Commit Info */}
        {lastCommit && (
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Last committed at: {lastCommit.time}</span>
            {lastCommit.url && (
              <a
                href={lastCommit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-200 flex items-center gap-1"
              >
                <span>Latest Commit</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* GitHub Repository Configuration Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-6">
        <div>
          <h3 className="font-display text-lg font-bold text-zinc-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-zinc-900" />
            <span>GitHub Repository & Token Vault</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Configure your repository credentials. Stored safely in your private browser session vault.
          </p>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1">
                GitHub Username / Owner *
              </label>
              <input
                type="text"
                required
                value={config.owner}
                onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                placeholder="e.g. zolepto"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1">
                Repository Name *
              </label>
              <input
                type="text"
                required
                value={config.repo}
                onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                placeholder="e.g. zolepto-portfolio"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700">
                GitHub Personal Access Token (PAT) *
              </label>
              <a
                href="https://github.com/settings/tokens?type=beta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
              >
                <span>Generate Token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                required
                value={config.token}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
                placeholder="ghp_... or github_pat_..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-900 transition-colors"
                title={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Need permissions: <code className="font-mono text-zinc-800 font-semibold">Contents (Read & Write)</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1">
                Target Branch
              </label>
              <input
                type="text"
                value={config.branch}
                onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                placeholder="main"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1">
                Target File Path
              </label>
              <input
                type="text"
                value={config.filePath}
                onChange={(e) => setConfig({ ...config, filePath: e.target.value })}
                placeholder="public/content.json"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          {/* Test Connection Status Banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              id="test-github-connection-btn"
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !config.token.trim() || !config.owner.trim() || !config.repo.trim()}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
              )}
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Save Credentials to Vault
            </button>
          </div>
        </form>
      </div>

      {/* Security Architecture Clarification Card */}
      <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200 space-y-4 text-xs text-zinc-600 leading-relaxed">
        <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Security Architecture: How Your GitHub Token Is Kept 100% Safe</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-1.5">
            <p className="font-semibold text-zinc-900">Why It Is Safe Right Now (The Secret Local Lock)</p>
            <p className="text-zinc-600">
              Your token is saved <strong>only inside your private browser session vault</strong>. It is never committed, hardcoded, or visible inside your public GitHub repository files. Visitors inspecting your website code cannot see or extract it.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-1.5">
            <p className="font-semibold text-zinc-900">How Method A Works With Vercel</p>
            <p className="text-zinc-600">
              When you click <strong>Commit & Push Live</strong>, your browser uses GitHub’s official REST API to update <code className="font-mono text-zinc-800">public/content.json</code>. Vercel automatically detects this commit and runs a zero-downtime production deployment within 20 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
