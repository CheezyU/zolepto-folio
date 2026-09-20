/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { loadLivePortfolioContent } from './githubSyncService';

/**
 * Computes a deterministic content-only fingerprint of the payload
 * (completely ignoring volatile timestamps) so comparisons only detect
 * actual changes in projects, media URLs, or site copy text.
 */
export function computeContentFingerprint(data: any): string {
  if (!data) return '';
  try {
    const settings = data.siteSettings || {};
    const showreels = Array.isArray(data.showreels) ? data.showreels : [];
    const graphics = Array.isArray(data.graphics) ? data.graphics : [];

    // Deterministic content string independent of timestamps
    const settingsDigest = Object.keys(settings)
      .sort()
      .map((k) => `${k}:${JSON.stringify(settings[k])}`)
      .join(';');

    const showreelsDigest = showreels
      .map((s: any) => `${s.id}|${s.title}|${s.youtubeUrl || s.videoUrl || ''}|${s.thumbnailUrl || ''}|${s.category || ''}`)
      .join(';');

    const graphicsDigest = graphics
      .map((g: any) => `${g.id}|${g.title}|${g.imageUrl || ''}|${g.category || ''}`)
      .join(';');

    return `${settingsDigest}___${showreelsDigest}___${graphicsDigest}`;
  } catch {
    return '';
  }
}

export interface SmartMonitorOptions {
  onContentUpdated?: (newContent: any) => void;
  isAdminActive?: () => boolean;
  isVideoActive?: () => boolean;
}

let activeMonitorCleanup: (() => void) | null = null;
let currentFingerprint = '';

/**
 * Starts the smart content update monitor.
 * Polls for authoritative content changes across Global Cloud Store & deployed sources.
 * When real updates are published, it updates the application state in memory without
 * interrupting user interaction or showing intrusive banners/reloads.
 */
export function startSmartUpdateMonitor(options: SmartMonitorOptions = {}): () => void {
  if (typeof window === 'undefined') return () => {};

  if (activeMonitorCleanup) {
    activeMonitorCleanup();
    activeMonitorCleanup = null;
  }

  let isCleanedUp = false;

  // Initialize fingerprint from existing local cache
  try {
    const bootData = localStorage.getItem('zolepto_last_pushed_payload');
    if (bootData) {
      const parsed = JSON.parse(bootData);
      currentFingerprint = computeContentFingerprint(parsed);
    }
  } catch {}

  const checkForLiveContentUpdates = async () => {
    if (isCleanedUp) return;

    // Skip polling if document is hidden to conserve bandwidth and prevent background churn
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return;
    }

    try {
      const live = await loadLivePortfolioContent();
      if (!live || isCleanedUp) return;

      const liveFingerprint = computeContentFingerprint(live);

      // Establish initial baseline
      if (!currentFingerprint) {
        currentFingerprint = liveFingerprint;
        return;
      }

      // Check if genuine content changed
      if (liveFingerprint && liveFingerprint !== currentFingerprint) {
        // Guard: If admin is actively editing, do not overwrite in-progress edits
        if (options.isAdminActive && options.isAdminActive()) return;

        const isAdminEditing =
          typeof window !== 'undefined' &&
          (localStorage.getItem('zolepto_admin_editing_active') === 'true' ||
            window.location.hash.toLowerCase().includes('admin') ||
            window.location.pathname.toLowerCase().includes('admin'));

        if (isAdminEditing) {
          try {
            const lastPortfolioEdit = parseInt(
              localStorage.getItem('zolepto_portfolio_last_edit_time') || '0',
              10
            );
            const lastSettingsEdit = parseInt(
              localStorage.getItem('zolepto_settings_last_edit_time') || '0',
              10
            );
            const lastEdit = Math.max(lastPortfolioEdit, lastSettingsEdit);
            const remoteTime = live.lastUpdated ? new Date(live.lastUpdated).getTime() : 0;
            if (lastEdit > 0 && remoteTime <= lastEdit) {
              return;
            }
          } catch {}
        }

        // Update in-memory reference
        currentFingerprint = liveFingerprint;

        // Seamlessly update in-memory React state with NO popups, reloads, or interruption
        if (options.onContentUpdated) {
          options.onContentUpdated(live);
        }
        window.dispatchEvent(
          new CustomEvent('zolepto:content-published', {
            detail: live,
          })
        );
      }
    } catch (err) {
      console.warn('Smart content update check encountered non-fatal error:', err);
    }
  };

  // Poll gently every 30 seconds
  const pollTimer = setInterval(checkForLiveContentUpdates, 30000);

  // Check on tab focus or restore visibility
  const handleFocus = () => checkForLiveContentUpdates();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      checkForLiveContentUpdates();
    }
  };

  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  const cleanup = () => {
    isCleanedUp = true;
    clearInterval(pollTimer);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibility);
  };

  activeMonitorCleanup = cleanup;
  return cleanup;
}

