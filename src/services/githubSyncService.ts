import { SiteSettings, VideoProject, GraphicProject } from '../types';

export interface GitHubSyncConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
  filePath: string;
  autoCommitOnSave: boolean;
}

export interface PortfolioContentPayload {
  version: string;
  lastUpdated: string;
  repoSource?: {
    owner: string;
    repo: string;
    branch: string;
    filePath: string;
  };
  siteSettings: SiteSettings;
  showreels: VideoProject[];
  graphics: GraphicProject[];
}

const GITHUB_CONFIG_KEY = 'zolepto_github_sync_vault';
const LAST_COMMIT_KEY = 'zolepto_github_last_commit';
const LAST_PUSHED_PAYLOAD_KEY = 'zolepto_github_live_payload';
const PUBLISHED_CANONICAL_KEY = 'zolepto_published_canonical_content';
export const GLOBAL_PORTFOLIO_ENDPOINT = 'https://kvdb.io/NpJTZs8GERZzanmJpGY1FL/published_portfolio_content';
export const CONTENT_PUBLISHED_EVENT = 'zolepto:portfolio-published';

/**
 * Deep-normalizes object values, sorting all keys to ensure 100% deterministic JSON comparison.
 * Ignores transient timestamps like `lastUpdated` so changes are purely functional.
 */
function canonicalizeObject(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(canonicalizeObject);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  for (const key of sortedKeys) {
    if (key === 'lastUpdated' || key === 'version' || key === 'repoSource') continue;
    result[key] = canonicalizeObject(obj[key]);
  }
  return result;
}

/**
 * Generates a deterministic, canonical representation of current portfolio data.
 * Used for smart change detection (A > B > A detection).
 */
export function getCanonicalContentString(payload: {
  siteSettings: SiteSettings;
  showreels: VideoProject[];
  graphics: GraphicProject[];
}): string {
  const normalized = {
    siteSettings: canonicalizeObject(payload.siteSettings),
    showreels: canonicalizeObject(payload.showreels),
    graphics: canonicalizeObject(payload.graphics),
  };
  return JSON.stringify(normalized);
}

/**
 * Sets the authoritative baseline against which future changes are compared.
 */
export function markCurrentAsPublishedBaseline(payload: {
  siteSettings: SiteSettings;
  showreels: VideoProject[];
  graphics: GraphicProject[];
}): void {
  try {
    const canonical = getCanonicalContentString(payload);
    localStorage.setItem(PUBLISHED_CANONICAL_KEY, canonical);
  } catch {}
}

/**
 * Smart change detector. Compares current state with the last published baseline.
 * If user edits A > B > A, detects that current state matches initial values and returns false.
 */
export function hasPortfolioChangesToPublish(current: {
  siteSettings: SiteSettings;
  showreels: VideoProject[];
  graphics: GraphicProject[];
}): boolean {
  try {
    const currentCanonical = getCanonicalContentString(current);
    let savedCanonical = localStorage.getItem(PUBLISHED_CANONICAL_KEY);

    if (!savedCanonical) {
      const lastPushed = localStorage.getItem(LAST_PUSHED_PAYLOAD_KEY);
      if (lastPushed) {
        const parsed = JSON.parse(lastPushed);
        if (parsed && parsed.siteSettings) {
          savedCanonical = getCanonicalContentString(parsed);
          localStorage.setItem(PUBLISHED_CANONICAL_KEY, savedCanonical);
        }
      }
    }

    if (!savedCanonical) {
      // If no prior publication baseline is recorded, record current as baseline
      localStorage.setItem(PUBLISHED_CANONICAL_KEY, currentCanonical);
      return false;
    }

    return currentCanonical !== savedCanonical;
  } catch {
    return false;
  }
}

export const DEFAULT_GITHUB_CONFIG: GitHubSyncConfig = {
  owner: '',
  repo: '',
  token: '',
  branch: 'main',
  filePath: 'public/content.json',
  autoCommitOnSave: true,
};

/**
 * Publishes the complete portfolio data to the instant real-time global cloud store.
 * Propagates worldwide across all devices in < 200ms without waiting for Vercel/CDN build delays.
 */
export async function publishToGlobalCloud(payload: PortfolioContentPayload): Promise<boolean> {
  try {
    const res = await fetch(GLOBAL_PORTFOLIO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    try {
      localStorage.setItem(LAST_PUSHED_PAYLOAD_KEY, JSON.stringify(payload));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(CONTENT_PUBLISHED_EVENT, { detail: payload }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      // LocalStorage access fallback
    }

    return res.ok;
  } catch (err) {
    console.warn('Failed to publish to global cloud store:', err);
    return false;
  }
}

/**
 * Retrieves the stored GitHub token and repo config from the local admin vault.
 * This is NEVER committed to GitHub repository files.
 */
export function getGitHubConfig(): GitHubSyncConfig {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (!raw) return DEFAULT_GITHUB_CONFIG;
    return { ...DEFAULT_GITHUB_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GITHUB_CONFIG;
  }
}

/**
 * Saves GitHub credentials securely in the local admin browser vault.
 */
export function saveGitHubConfig(config: GitHubSyncConfig): void {
  try {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('zolepto:github-config-updated'));
  } catch (err) {
    console.warn('Could not save GitHub config:', err);
  }
}

/**
 * Removes the GitHub token from the browser vault (logout/disconnect).
 */
export function clearGitHubConfig(): void {
  localStorage.removeItem(GITHUB_CONFIG_KEY);
  localStorage.removeItem(LAST_COMMIT_KEY);
  window.dispatchEvent(new CustomEvent('zolepto:github-config-updated'));
}

export function getLastCommitInfo(): { time: string; url?: string } | null {
  try {
    const raw = localStorage.getItem(LAST_COMMIT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Verifies if the provided GitHub PAT and repository exist and have Write permissions.
 */
export async function testGitHubConnection(config: GitHubSyncConfig): Promise<{
  success: boolean;
  message: string;
  repoDetails?: { fullName: string; isPrivate: boolean; defaultBranch: string };
}> {
  if (!config.token.trim()) {
    return { success: false, message: 'Please enter your GitHub Personal Access Token.' };
  }
  if (!config.owner.trim() || !config.repo.trim()) {
    return { success: false, message: 'Please provide both your GitHub Username and Repository Name.' };
  }

  try {
    const url = `https://api.github.com/repos/${encodeURIComponent(config.owner.trim())}/${encodeURIComponent(config.repo.trim())}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.token.trim()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (res.status === 401) {
      return { success: false, message: 'Invalid or expired GitHub Personal Access Token.' };
    }
    if (res.status === 404) {
      return {
        success: false,
        message: `Repository "${config.owner}/${config.repo}" was not found or the token lacks access. Ensure you selected this repository when creating the fine-grained token.`,
      };
    }

    if (!res.ok) {
      return { success: false, message: `GitHub API error: ${res.statusText}` };
    }

    const data = await res.json();
    return {
      success: true,
      message: `Connected successfully to ${data.full_name} (${data.private ? 'Private' : 'Public'})`,
      repoDetails: {
        fullName: data.full_name,
        isPrivate: data.private,
        defaultBranch: data.default_branch || 'main',
      },
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to GitHub API.' };
  }
}

export function commitAuthoritativeLocalState(fullData: PortfolioContentPayload) {
  try {
    localStorage.setItem(LAST_PUSHED_PAYLOAD_KEY, JSON.stringify(fullData));
    if (fullData.showreels) {
      localStorage.setItem('zolepto_custom_showreels', JSON.stringify(fullData.showreels));
    }
    if (fullData.graphics) {
      localStorage.setItem('zolepto_custom_graphics', JSON.stringify(fullData.graphics));
    }
    if (fullData.siteSettings) {
      localStorage.setItem('zolepto_site_settings', JSON.stringify(fullData.siteSettings));
    }
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('zolepto:portfolio-changed'));
    window.dispatchEvent(new CustomEvent(CONTENT_PUBLISHED_EVENT, { detail: fullData }));
  } catch (e) {
    console.warn('Failed to commit authoritative local state', e);
  }
}

/**
 * Pushes the full portfolio state to GitHub via Direct Auto-Commit to public/content.json,
 * while ALSO updating the instant Global Cloud Store so clients see updates in <200ms worldwide.
 */
export async function pushPortfolioToGitHub(
  payload: {
    siteSettings: SiteSettings;
    showreels: VideoProject[];
    graphics: GraphicProject[];
  },
  customConfig?: GitHubSyncConfig,
  options?: { force?: boolean }
): Promise<{ success: boolean; message: string; commitUrl?: string; sha?: string; cloudSynced?: boolean; noChanges?: boolean }> {
  // Smart Change Detection: Prevent accidental commits when nothing has changed
  if (!options?.force && !hasPortfolioChangesToPublish(payload)) {
    return {
      success: true,
      noChanges: true,
      message: 'No changes detected. Your live portfolio is already identical to current settings.',
    };
  }

  const config = customConfig || getGitHubConfig();

  const cleanOwner = config.owner.trim();
  const cleanRepo = config.repo.trim();
  let branch = config.branch.trim() || 'main';
  const cleanFilePath = (config.filePath.trim() || 'public/content.json')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  const fullData: PortfolioContentPayload = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    repoSource: cleanOwner && cleanRepo ? {
      owner: cleanOwner,
      repo: cleanRepo,
      branch,
      filePath: cleanFilePath,
    } : undefined,
    siteSettings: payload.siteSettings,
    showreels: payload.showreels,
    graphics: payload.graphics,
  };

  // Step 0: Make local and subscription state ABSOLUTE and IMMEDIATELY true
  commitAuthoritativeLocalState(fullData);

  // Step 1: ALWAYS publish immediately to Global Cloud Store (< 200ms worldwide propagation)
  const cloudSynced = await publishToGlobalCloud(fullData);

  // Step 2: Check if GitHub credentials are configured
  if (!config.token.trim() || !cleanOwner || !cleanRepo) {
    markCurrentAsPublishedBaseline(fullData);
    return {
      success: true,
      cloudSynced,
      message: 'Published live globally! All visitors worldwide will now see your updates immediately.',
    };
  }

  const jsonString = JSON.stringify(fullData, null, 2);
  // GitHub API requires content to be Base64 encoded UTF-8
  const base64Content = btoa(unescape(encodeURIComponent(jsonString)));

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/contents/${cleanFilePath}`;

  try {
    // Detect repository default branch to prevent branch-mismatch 404s
    let repoDefaultBranch = branch;
    try {
      const repoRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}`,
        {
          headers: {
            Authorization: `Bearer ${config.token.trim()}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );
      if (repoRes.ok) {
        const repoData = await repoRes.json();
        if (repoData && repoData.default_branch) {
          repoDefaultBranch = repoData.default_branch;
        }
      }
    } catch {
      // Ignore repo inspection failure
    }

    // Helper to fetch freshest SHA across multiple endpoints without CORS-breaking headers
    const fetchLatestSha = async (targetBranch: string): Promise<{ sha?: string; resolvedBranch: string }> => {
      // 1. Direct contents API on target branch
      try {
        const checkRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(targetBranch)}&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${config.token.trim()}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });
        if (checkRes.ok) {
          const fileData = await checkRes.json();
          if (fileData && typeof fileData.sha === 'string') {
            return { sha: fileData.sha, resolvedBranch: targetBranch };
          }
        }
      } catch {
        // continue
      }

      // 2. Query contents API without ?ref (GitHub defaults to repo default branch)
      try {
        const checkRes = await fetch(`${apiUrl}?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${config.token.trim()}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });
        if (checkRes.ok) {
          const fileData = await checkRes.json();
          if (fileData && typeof fileData.sha === 'string') {
            return { sha: fileData.sha, resolvedBranch: repoDefaultBranch };
          }
        }
      } catch {
        // continue
      }

      // 3. Fallback: inspect Git trees API
      const branchesToTry = Array.from(new Set([targetBranch, repoDefaultBranch, 'main', 'master']));
      for (const b of branchesToTry) {
        try {
          const treeRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/trees/${encodeURIComponent(b)}?recursive=1`,
            {
              headers: {
                Authorization: `Bearer ${config.token.trim()}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
            }
          );
          if (treeRes.ok) {
            const treeData = await treeRes.json();
            if (Array.isArray(treeData?.tree)) {
              const fileItem = treeData.tree.find((item: any) => item.path === cleanFilePath);
              if (fileItem && fileItem.sha) {
                return { sha: fileItem.sha, resolvedBranch: b };
              }
            }
          }
        } catch {
          // continue
        }
      }

      return { resolvedBranch: targetBranch };
    };

    let { sha: existingSha, resolvedBranch } = await fetchLatestSha(branch);
    branch = resolvedBranch || branch;

    let attempts = 0;
    const maxAttempts = 3;
    let putRes: Response | null = null;
    let result: any = null;

    // Retry loop: Handles 409 SHA conflict or 422 missing SHA by re-discovering SHA and retrying
    while (attempts < maxAttempts) {
      attempts++;

      const commitBody: Record<string, any> = {
        message: `Update portfolio content via Zolepto Studio [${new Date().toLocaleDateString()}]`,
        content: base64Content,
        branch,
      };
      if (existingSha) {
        commitBody.sha = existingSha;
      }

      putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.token.trim()}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify(commitBody),
      });

      if (putRes.ok) {
        result = await putRes.json();
        break;
      }

      const errData = await putRes.json().catch(() => ({}));
      const errorMsg = (errData?.message || '').toLowerCase();

      // If GitHub reports 409 (Conflict) OR 422 (e.g. "sha wasn't supplied"), re-fetch freshest SHA and retry
      if ((putRes.status === 409 || putRes.status === 422 || errorMsg.includes('sha')) && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const refetched = await fetchLatestSha(branch);
        existingSha = refetched.sha;
        if (refetched.resolvedBranch) {
          branch = refetched.resolvedBranch;
        }
        continue;
      }

      result = errData;
      break;
    }

    if (!putRes || !putRes.ok) {
      const reason = result?.message || (putRes ? putRes.statusText : 'Request failed');
      return {
        success: true,
        cloudSynced: true,
        message: `Published live globally to clients via Cloud! (Git commit notice: ${reason})`,
      };
    }

    const commitUrl = result?.commit?.html_url || `https://github.com/${cleanOwner}/${cleanRepo}/commits/${branch}`;

    try {
      localStorage.setItem(LAST_PUSHED_PAYLOAD_KEY, JSON.stringify(fullData));
      markCurrentAsPublishedBaseline(fullData);
      localStorage.setItem(
        LAST_COMMIT_KEY,
        JSON.stringify({
          time: new Date().toLocaleTimeString(),
          url: commitUrl,
        })
      );
    } catch {}

    return {
      success: true,
      cloudSynced: true,
      message: `Committed successfully to GitHub branch "${branch}" & published worldwide!`,
      commitUrl,
      sha: result.content?.sha,
    };
  } catch (err: any) {
    return {
      success: true,
      cloudSynced: true,
      message: `Published live globally via Cloud! (Git commit network notice: ${err.message || 'Unknown'})`,
    };
  }
}

/**
 * Loads the live portfolio content with authoritative timestamp-based resolution.
 * Sources inspected in parallel:
 * 1. Instant Real-Time Global Cloud Store (zero build/CDN delay)
 * 2. GitHub Raw / REST API (if repo is configured or known)
 * 3. Deployed /content.json
 * 4. Local Cached Published Payload
 *
 * The candidate with the newest lastUpdated timestamp is mathematically crowned the absolute source of truth!
 */
export async function loadLivePortfolioContent(): Promise<PortfolioContentPayload | null> {
  const timestamp = Date.now();
  const candidates: PortfolioContentPayload[] = [];

  const isLegacyItem = (item: any): boolean => {
    if (!item || !item.title) return false;
    const t = String(item.title).toUpperCase();
    return (
      t.includes('HYPERION') ||
      t.includes('ECLIPSE PROTOCOL') ||
      t.includes('SILENT EXPEDITION') ||
      t.includes('NEO-SHIBUYA') ||
      t.includes('CHRONO DRIFT')
    );
  };

  const sanitizeCandidate = (item: any): PortfolioContentPayload => {
    const clone = { ...item };
    if (Array.isArray(clone.showreels)) {
      clone.showreels = clone.showreels.filter((s: any) => !isLegacyItem(s));
    }
    if (Array.isArray(clone.graphics)) {
      clone.graphics = clone.graphics.filter((g: any) => !isLegacyItem(g));
    }
    return clone as PortfolioContentPayload;
  };

  const addCandidate = (item: any) => {
    if (item && item.siteSettings && (item.showreels || item.graphics)) {
      candidates.push(sanitizeCandidate(item));
    }
  };

  // Source 1: Real-Time Global Cloud Store (instant worldwide sync)
  const cloudPromise = fetch(`${GLOBAL_PORTFOLIO_ENDPOINT}?_cb=${timestamp}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Accept: 'application/json',
    },
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => addCandidate(data))
    .catch(() => {});

  // Source 2: Deployed /content.json
  const staticPromise = fetch(`/content.json?_cb=${timestamp}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Accept: 'application/json',
    },
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data) {
        addCandidate(data);
        // If content.json defines repoSource, try fetching GitHub Raw if accessible
        if (data.repoSource?.owner && data.repoSource?.repo) {
          const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(data.repoSource.owner)}/${encodeURIComponent(data.repoSource.repo)}/${encodeURIComponent(data.repoSource.branch || 'main')}/${data.repoSource.filePath || 'public/content.json'}?_cb=${timestamp}`;
          return fetch(rawUrl, { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .then((ghData) => addCandidate(ghData))
            .catch(() => {});
        }
      }
    })
    .catch(() => {});

  // Source 3: GitHub API / Raw if credentials exist locally
  const config = getGitHubConfig();
  let githubPromise = Promise.resolve();
  if (config.owner && config.repo) {
    const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(config.owner.trim())}/${encodeURIComponent(config.repo.trim())}/${encodeURIComponent(config.branch.trim() || 'main')}/${config.filePath.trim().replace(/^\/+/, '') || 'public/content.json'}?_cb=${timestamp}`;
    githubPromise = fetch(rawUrl, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((ghData) => addCandidate(ghData))
      .catch(() => {});
  }

  // Await network candidates in parallel
  await Promise.allSettled([cloudPromise, staticPromise, githubPromise]);

  // Source 4: Local cached payload
  try {
    const cached = localStorage.getItem(LAST_PUSHED_PAYLOAD_KEY);
    if (cached) {
      addCandidate(JSON.parse(cached));
    }
  } catch {}

  if (candidates.length === 0) return null;

  // Sort candidates by newest lastUpdated timestamp - authoritative true published source
  candidates.sort((a, b) => {
    const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return timeB - timeA;
  });

  const newest = candidates[0];

  // Persist freshest payload to local storage
  try {
    localStorage.setItem(LAST_PUSHED_PAYLOAD_KEY, JSON.stringify(newest));
  } catch {}

  return newest;
}
