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

export const DEFAULT_GITHUB_CONFIG: GitHubSyncConfig = {
  owner: '',
  repo: '',
  token: '',
  branch: 'main',
  filePath: 'public/content.json',
  autoCommitOnSave: true,
};

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

/**
 * Pushes the full portfolio state to GitHub via Direct Auto-Commit to public/content.json.
 * Also embeds repo metadata so clients can pull real-time GitHub raw updates instantly with zero cache delay!
 */
export async function pushPortfolioToGitHub(
  payload: {
    siteSettings: SiteSettings;
    showreels: VideoProject[];
    graphics: GraphicProject[];
  },
  customConfig?: GitHubSyncConfig
): Promise<{ success: boolean; message: string; commitUrl?: string; sha?: string }> {
  const config = customConfig || getGitHubConfig();

  if (!config.token.trim() || !config.owner.trim() || !config.repo.trim()) {
    return {
      success: false,
      message: 'GitHub credentials are not configured in the Admin Vault. Please enter your Token and Repository details in Admin Settings.',
    };
  }

  const cleanOwner = config.owner.trim();
  const cleanRepo = config.repo.trim();
  const branch = config.branch.trim() || 'main';
  const filePath = config.filePath.trim() || 'public/content.json';

  const fullData: PortfolioContentPayload = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    repoSource: {
      owner: cleanOwner,
      repo: cleanRepo,
      branch,
      filePath,
    },
    siteSettings: payload.siteSettings,
    showreels: payload.showreels,
    graphics: payload.graphics,
  };

  const jsonString = JSON.stringify(fullData, null, 2);
  // GitHub API requires content to be Base64 encoded UTF-8
  const base64Content = btoa(unescape(encodeURIComponent(jsonString)));

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/contents/${filePath}`;

  try {
    // 1. Fetch current file SHA if file already exists
    let existingSha: string | undefined;
    const checkRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
      headers: {
        Authorization: `Bearer ${config.token.trim()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (checkRes.ok) {
      const fileData = await checkRes.json();
      existingSha = fileData.sha;
    }

    // 2. Put file to GitHub (create or update commit)
    const commitBody: any = {
      message: `Update portfolio content via Zolepto Studio [${new Date().toLocaleDateString()}]`,
      content: base64Content,
      branch,
    };
    if (existingSha) {
      commitBody.sha = existingSha;
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.token.trim()}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(commitBody),
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      const reason = errData.message || putRes.statusText;
      return { success: false, message: `Failed to commit to GitHub: ${reason}` };
    }

    const result = await putRes.json();
    const commitUrl = result.commit?.html_url || `https://github.com/${cleanOwner}/${cleanRepo}/commits/${branch}`;

    // Cache the pushed payload in local vault so current device has instant confirmation
    try {
      localStorage.setItem(LAST_PUSHED_PAYLOAD_KEY, JSON.stringify(fullData));
      localStorage.setItem(
        LAST_COMMIT_KEY,
        JSON.stringify({
          time: new Date().toLocaleTimeString(),
          url: commitUrl,
        })
      );
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Committed successfully to GitHub branch "${branch}"! Real-time global sync active.`,
      commitUrl,
      sha: result.content?.sha,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network or GitHub error: ${err.message || 'Unknown failure'}`,
    };
  }
}

/**
 * Loads the live portfolio content with multi-tiered fallback:
 * 1. Fast Cache-busted fetch to /content.json
 * 2. If repoSource is known or configured, checks GitHub Raw endpoint for instant zero-delay sync
 * 3. Falls back to local cached payload if network is offline
 */
export async function loadLivePortfolioContent(): Promise<PortfolioContentPayload | null> {
  // First, check if GitHub repo is known from config or previous payload
  const config = getGitHubConfig();
  const timestamp = Date.now();

  // Tier 1: Try GitHub Raw if repository is public and configured (bypasses Vercel build delay completely!)
  if (config.owner && config.repo) {
    const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(config.owner.trim())}/${encodeURIComponent(config.repo.trim())}/${encodeURIComponent(config.branch.trim() || 'main')}/${config.filePath.trim() || 'public/content.json'}?_nocache=${timestamp}`;
    try {
      const rawRes = await fetch(rawUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      if (rawRes.ok) {
        const rawData = await rawRes.json();
        if (rawData && rawData.siteSettings && (rawData.showreels || rawData.graphics)) {
          return rawData as PortfolioContentPayload;
        }
      }
    } catch {
      // GitHub raw fallback to local /content.json
    }
  }

  // Tier 2: Fetch deployed /content.json with rigorous cache-busting headers
  try {
    const res = await fetch(`/content.json?_t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.siteSettings && (data.showreels || data.graphics)) {
        // If content.json defines repoSource and we don't have it configured locally yet, try fetching GitHub Raw if newer
        if (data.repoSource?.owner && data.repoSource?.repo) {
          try {
            const rawGitHubUrl = `https://raw.githubusercontent.com/${encodeURIComponent(data.repoSource.owner)}/${encodeURIComponent(data.repoSource.repo)}/${encodeURIComponent(data.repoSource.branch || 'main')}/${data.repoSource.filePath || 'public/content.json'}?_nocache=${timestamp}`;
            const ghRes = await fetch(rawGitHubUrl, { cache: 'no-store' });
            if (ghRes.ok) {
              const ghData = await ghRes.json();
              if (
                ghData?.lastUpdated &&
                data.lastUpdated &&
                new Date(ghData.lastUpdated).getTime() > new Date(data.lastUpdated).getTime()
              ) {
                return ghData as PortfolioContentPayload;
              }
            }
          } catch {
            // Keep local data
          }
        }

        return data as PortfolioContentPayload;
      }
    }
  } catch {
    // Network failure
  }

  // Tier 3: Local cached payload fallback
  try {
    const cached = localStorage.getItem(LAST_PUSHED_PAYLOAD_KEY);
    if (cached) {
      return JSON.parse(cached) as PortfolioContentPayload;
    }
  } catch {
    // ignore
  }

  return null;
}
