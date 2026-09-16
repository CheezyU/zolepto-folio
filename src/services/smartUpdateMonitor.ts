/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { loadLivePortfolioContent } from './githubSyncService';

const REFRESHED_VERSION_KEY = 'zolepto_last_refreshed_version';
const INITIAL_BOOT_VERSION_KEY = 'zolepto_boot_content_fingerprint';

/**
 * Computes a lightweight deterministic string fingerprint of the content payload
 * to guarantee that a refresh is ONLY triggered when actual content details change.
 */
export function computeContentFingerprint(data: any): string {
  if (!data) return '';
  try {
    const settingsStr = JSON.stringify(data.siteSettings || {});
    const showreelsCount = Array.isArray(data.showreels) ? data.showreels.length : 0;
    const showreelsHead = Array.isArray(data.showreels)
      ? data.showreels.map((s: any) => `${s.id}:${s.title}:${s.videoUrl || ''}`).join('|')
      : '';
    const graphicsCount = Array.isArray(data.graphics) ? data.graphics.length : 0;
    const graphicsHead = Array.isArray(data.graphics)
      ? data.graphics.map((g: any) => `${g.id}:${g.title}:${g.imageUrl || ''}`).join('|')
      : '';
    const timestamp = data.lastUpdated || '';

    return `${timestamp}__${settingsStr.length}__${showreelsCount}:${showreelsHead}__${graphicsCount}:${graphicsHead}`;
  } catch {
    return String(data.lastUpdated || Date.now());
  }
}

export interface SmartMonitorOptions {
  onContentUpdated?: (newContent: any) => void;
  isAdminActive?: () => boolean;
  isVideoActive?: () => boolean;
}

let activeMonitorCleanup: (() => void) | null = null;
let currentFingerprint = '';
let currentTimestamp = '';

/**
 * Starts the smart content update monitor.
 * Detects authoritative content changes across Global Cloud Store & GitHub / content.json.
 * Only triggers an auto-refresh fallback if a genuine change is detected and conditions are safe.
 */
export function startSmartUpdateMonitor(options: SmartMonitorOptions = {}): () => void {
  if (typeof window === 'undefined') return () => {};

  if (activeMonitorCleanup) {
    activeMonitorCleanup();
    activeMonitorCleanup = null;
  }

  let isCleanedUp = false;
  let pendingReloadTimestamp: string | null = null;

  // Initialize fingerprint from existing local cache or wait for first fetch
  try {
    const bootData = localStorage.getItem('zolepto_last_pushed_payload');
    if (bootData) {
      const parsed = JSON.parse(bootData);
      currentFingerprint = computeContentFingerprint(parsed);
      currentTimestamp = parsed.lastUpdated || '';
    }
  } catch {}

  const isUserInteractingWithForm = (): boolean => {
    try {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
        return true;
      }
      const form = document.getElementById('consultation-form') as HTMLFormElement;
      if (form) {
        const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
        for (const input of inputs) {
          if (input.name !== 'botcheck' && input.name !== '_bot_trap' && input.value.trim().length > 0) {
            return true;
          }
        }
      }
    } catch {}
    return false;
  };

  const isSafeToRefresh = (): boolean => {
    // 1. Guard against refreshing during active admin session
    if (options.isAdminActive && options.isAdminActive()) return false;
    if (window.location.hash.toLowerCase().includes('admin') || window.location.pathname.toLowerCase().includes('admin')) {
      return false;
    }

    // 2. Guard against interrupting full-screen video theater playback
    if (options.isVideoActive && options.isVideoActive()) return false;

    // 3. Guard against interrupting client form typing / consultation entry
    if (isUserInteractingWithForm()) return false;

    return true;
  };

  const executeSmartRefresh = (newTimestamp: string) => {
    try {
      sessionStorage.setItem(REFRESHED_VERSION_KEY, newTimestamp);
    } catch {}

    // Dispatch event to show subtle banner before reload
    window.dispatchEvent(
      new CustomEvent('zolepto:auto-refresh-imminent', {
        detail: { timestamp: newTimestamp },
      })
    );

    // Smooth reload after giving UI a moment to show notification
    setTimeout(() => {
      if (!isCleanedUp) {
        window.location.reload();
      }
    }, 1400);
  };

  const checkForLiveContentUpdates = async () => {
    if (isCleanedUp) return;

    try {
      const live = await loadLivePortfolioContent();
      if (!live || isCleanedUp) return;

      const liveFingerprint = computeContentFingerprint(live);
      const liveTimestamp = live.lastUpdated || '';

      // If initial baseline was empty, establish it now
      if (!currentFingerprint) {
        currentFingerprint = liveFingerprint;
        currentTimestamp = liveTimestamp;
        return;
      }

      // Check if a genuine update has occurred:
      // Fingerprint must differ OR timestamp must be newer
      const hasContentChanged = liveFingerprint !== currentFingerprint;
      const isNewerTimestamp =
        liveTimestamp &&
        currentTimestamp &&
        new Date(liveTimestamp).getTime() > new Date(currentTimestamp).getTime();

      if (hasContentChanged || isNewerTimestamp) {
        // Update in-memory reference
        currentFingerprint = liveFingerprint;
        currentTimestamp = liveTimestamp;

        // Broadcast to React state so UI updates in real-time smoothly
        if (options.onContentUpdated) {
          options.onContentUpdated(live);
        }
        window.dispatchEvent(
          new CustomEvent('zolepto:content-published', {
            detail: live,
          })
        );

        // Smart Auto-Refresh Fallback Logic:
        // Check if this version was already refreshed during this session to prevent reload loops
        const alreadyRefreshed = sessionStorage.getItem(REFRESHED_VERSION_KEY);
        if (alreadyRefreshed === liveTimestamp) {
          return;
        }

        if (isSafeToRefresh()) {
          executeSmartRefresh(liveTimestamp);
        } else {
          // Defer until user interaction finishes
          pendingReloadTimestamp = liveTimestamp;
        }
      }
    } catch (err) {
      console.warn('Smart content update check encountered non-fatal error:', err);
    }
  };

  // Poll periodically (every 10 seconds)
  const pollTimer = setInterval(checkForLiveContentUpdates, 10000);

  // Check immediately on initial start
  setTimeout(checkForLiveContentUpdates, 2000);

  // Check whenever user focuses tab or restores visibility
  const handleFocus = () => checkForLiveContentUpdates();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      checkForLiveContentUpdates();
    }
  };

  // Watch for when deferred reload becomes safe
  const deferredCheckInterval = setInterval(() => {
    if (pendingReloadTimestamp && isSafeToRefresh()) {
      const ts = pendingReloadTimestamp;
      pendingReloadTimestamp = null;
      executeSmartRefresh(ts);
    }
  }, 3000);

  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  const cleanup = () => {
    isCleanedUp = true;
    clearInterval(pollTimer);
    clearInterval(deferredCheckInterval);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibility);
  };

  activeMonitorCleanup = cleanup;
  return cleanup;
}
