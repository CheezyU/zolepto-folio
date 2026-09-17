import { SubmittedBooking } from '../types';

const INQUIRIES_STORAGE_KEY = 'zolepto_submitted_inquiries';
const INQUIRIES_EVENT = 'zolepto:inquiries-changed';

/**
 * Obfuscated inbox decoders to shield email addresses from automated scraper bots,
 * regex crawlers, and spam harvesters scanning static JS bundles.
 */
function decodeSecureInbox(encoded: string): string {
  try {
    if (typeof atob !== 'undefined') {
      return atob(encoded);
    }
    return Buffer.from(encoded, 'base64').toString('utf-8');
  } catch {
    return 'zolepto@gmail.com';
  }
}

// Primary target: zolepto@gmail.com | Fallback target: cheddarc19@gmail.com
export const PRIMARY_INBOX = decodeSecureInbox('em9sZXB0b0BnbWFpbC5jb20='); // zolepto@gmail.com
export const SECONDARY_INBOX = decodeSecureInbox('Y2hlZGRhcmMxOUBnbWFpbC5jb20='); // cheddarc19@gmail.com

// Primary & Secondary resilient cloud synchronization endpoints
const CLOUD_INQUIRIES_ENDPOINT = 'https://kvdb.io/NpJTZs8GERZzanmJpGY1FL/inquiries';

/**
 * Strips script tags, HTML markup, and CRLF line breaks to block email header injection attacks
 */
export function sanitizeInput(input: string, allowMultiline = false): string {
  if (!input) return '';
  let clean = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .replace(/\0/g, '');

  if (!allowMultiline) {
    clean = clean.replace(/[\r\n]+/g, ' ');
  }
  return clean.trim();
}

/**
 * Masks an email for safe display without exposing complete address to scrapers
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'Protected Email';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user.slice(0, 2)}${'*'.repeat(Math.min(4, user.length - 2))}${user.slice(-1)}@${domain}`;
}

/**
 * Format and dispatch an immediate rich alert to Discord, Slack, or any standard webhook
 */
export async function dispatchWebhookNotification(
  webhookUrl: string,
  inquiry: SubmittedBooking
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) return false;

  try {
    const isDiscord = webhookUrl.includes('discord.com') || webhookUrl.includes('discordapp.com');
    const isSlack = webhookUrl.includes('slack.com');

    let bodyPayload: any;

    if (isDiscord) {
      bodyPayload = {
        content: `🚨 **New Portfolio Inquiry Received from ${inquiry.fullName}!**`,
        embeds: [
          {
            title: `🎬 Client Brief: ${inquiry.fullName}`,
            description: inquiry.brief ? `> ${inquiry.brief}` : '*No written brief provided*',
            color: 2470550, // Emerald green tone
            fields: [
              { name: '📧 Client Email', value: inquiry.email || 'N/A', inline: true },
              { name: '🎯 Focus / Scope', value: inquiry.projectType || 'General', inline: true },
              { name: '💰 Target Budget', value: inquiry.estimatedBudget || 'Flexible / Open', inline: true },
              { name: '🔗 Assets & Links', value: inquiry.links ? inquiry.links : 'None', inline: false },
              { name: '🆔 Tracking Code', value: inquiry.id, inline: true },
              { name: '🕒 Submitted At', value: inquiry.submittedAt, inline: true },
            ],
            footer: { text: 'Zolepto Studio • Instant Intake Alert' },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    } else if (isSlack) {
      bodyPayload = {
        text: `*New Portfolio Inquiry [${inquiry.id}]*\n*Client:* ${inquiry.fullName} (${inquiry.email})\n*Scope:* ${inquiry.projectType}\n*Budget:* ${inquiry.estimatedBudget}\n*Brief:* ${inquiry.brief || 'None'}\n*Links:* ${inquiry.links || 'None'}`,
      };
    } else {
      // Generic Webhook payload (Zapier, Make, custom server)
      bodyPayload = {
        event: 'portfolio_inquiry',
        ...inquiry,
        timestamp: new Date().toISOString(),
      };
    }

    const res = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    return res.ok;
  } catch (err) {
    console.warn('Webhook dispatch failed:', err);
    return false;
  }
}

/**
 * Sends a lightweight test ping to verify a webhook URL
 */
export async function testWebhookPing(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    return { success: false, error: 'Please enter a valid HTTP/HTTPS Webhook URL.' };
  }

  try {
    const isDiscord = webhookUrl.includes('discord.com') || webhookUrl.includes('discordapp.com');
    const payload = isDiscord
      ? {
          content: '✅ **Zolepto Portfolio Webhook Verified!** Inquiries submitted on your site will instantly ping here.',
        }
      : {
          test: true,
          message: 'Zolepto Portfolio Webhook connection verified successfully.',
        };

    const res = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 204) {
      return { success: true };
    } else {
      return { success: false, error: `Webhook returned status HTTP ${res.status}` };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error connecting to webhook' };
  }
}

// Active in-flight inquiry guard to prevent duplicate API dispatches and double usage counts
const inFlightInquiryIds = new Set<string>();

/**
 * Saves an inquiry to the persistent global cloud store so it immediately reflects
 * on the Admin Panel on PC across devices, dispatches to webhooks, and forwards emails via Web3Forms.
 */
export async function saveInquiry(
  inquiry: SubmittedBooking & { _bot_trap?: string; botcheck?: boolean | string },
  customWebhookUrl?: string,
  customWeb3FormsKey?: string
): Promise<{ id: string; emailSent: boolean; cloudSynced: boolean; webhookSent: boolean; error?: string }> {
  // Anti-Bot Defense 1: If honeypot trap field or botcheck has any content, silently simulate success (bot trapped)
  if (
    (inquiry._bot_trap && inquiry._bot_trap.trim().length > 0) ||
    Boolean(inquiry.botcheck)
  ) {
    console.warn('Spam bot intercepted by client honeypot trap.');
    return { id: inquiry.id, emailSent: true, cloudSynced: false, webhookSent: false };
  }

  // Prevent duplicate execution for the same inquiry ID (e.g. rapid clicks or retries)
  if (inFlightInquiryIds.has(inquiry.id)) {
    console.log(`Inquiry ${inquiry.id} is already in-flight, preventing duplicate dispatch.`);
    return { id: inquiry.id, emailSent: true, cloudSynced: true, webhookSent: true };
  }
  inFlightInquiryIds.add(inquiry.id);

  // Auto-clear from in-flight tracker after 15 seconds to allow fresh submissions later
  setTimeout(() => {
    inFlightInquiryIds.delete(inquiry.id);
  }, 15000);

  // Sanitize all inquiry fields
  const cleanInquiry: SubmittedBooking = {
    ...inquiry,
    fullName: sanitizeInput(inquiry.fullName),
    email: sanitizeInput(inquiry.email),
    projectType: sanitizeInput(inquiry.projectType),
    estimatedBudget: sanitizeInput(inquiry.estimatedBudget || ''),
    brief: sanitizeInput(inquiry.brief || '', true),
    links: sanitizeInput(inquiry.links || '', true),
    id: sanitizeInput(inquiry.id),
    submittedAt: sanitizeInput(inquiry.submittedAt),
  };

  // 1. Save locally for immediate display
  saveInquiryLocally(cleanInquiry);

  // 2. Persist to Global Cloud Store (so Admin Panel sees it live across devices and countries)
  let cloudSynced = false;
  try {
    let remoteList: SubmittedBooking[] = [];
    try {
      const getRes = await fetch(`${CLOUD_INQUIRIES_ENDPOINT}?_nocache=${Date.now()}`, {
        cache: 'no-store',
      });
      if (getRes.ok) {
        const text = await getRes.text();
        if (text && text.trim()) {
          remoteList = JSON.parse(text);
        }
      }
    } catch {
      // fresh list
    }

    const filtered = remoteList.filter((item) => item.id !== cleanInquiry.id);
    const updatedRemote = [cleanInquiry, ...filtered];

    const putRes = await fetch(CLOUD_INQUIRIES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRemote),
    });

    if (putRes.ok) {
      cloudSynced = true;
    }
  } catch (cloudErr) {
    console.warn('Could not sync inquiry to cloud store:', cloudErr);
  }

  // 3. Dispatch to Webhook if configured (Discord, Slack, Make, Zapier)
  let webhookSent = false;
  if (customWebhookUrl) {
    try {
      webhookSent = await dispatchWebhookNotification(customWebhookUrl, cleanInquiry);
    } catch {
      // non-blocking
    }
  }

  // 4. Web3Forms Free Plan Email Dispatch (Single, clean JSON submission)
  let emailSent = false;
  const accessKey =
    (customWeb3FormsKey && customWeb3FormsKey.trim() && customWeb3FormsKey !== '64d852a4-5696-414c-a11b-10f845dca889'
      ? customWeb3FormsKey.trim()
      : 'cce7d17a-a640-443a-b066-33c06020b08e');

  try {
    const payload = {
      access_key: accessKey,
      name: cleanInquiry.fullName,
      email: cleanInquiry.email,
      subject: `[${cleanInquiry.id}] New Inquiry from ${cleanInquiry.fullName}`,
      from_name: `Portfolio Inquiry (${cleanInquiry.fullName})`,
      replyto: cleanInquiry.email,
      project_scope: cleanInquiry.projectType,
      budget: cleanInquiry.estimatedBudget || 'Flexible / Open',
      links: cleanInquiry.links || 'None provided',
      inquiry_id: cleanInquiry.id,
      submitted_at: cleanInquiry.submittedAt,
      message: cleanInquiry.brief || 'No written brief provided',
      botcheck: '', // Web3Forms built-in anti-spam honeypot: clean for real humans
    };

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        emailSent = true;
      }
    }
  } catch (err) {
    console.warn('Web3Forms fetch dispatch error:', err);
  }

  return { id: cleanInquiry.id, emailSent, cloudSynced, webhookSent };
}

/**
 * Fetches inquiries from the global cloud store and synchronizes with local storage.
 */
export async function syncInquiriesFromCloud(): Promise<SubmittedBooking[]> {
  try {
    const res = await fetch(`${CLOUD_INQUIRIES_ENDPOINT}?_nocache=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim()) {
        const cloudItems: SubmittedBooking[] = JSON.parse(text);
        if (Array.isArray(cloudItems)) {
          // Merge with local items
          const localItems = getInquiriesLocally();
          const map = new Map<string, SubmittedBooking>();
          // Cloud items first
          for (const item of cloudItems) {
            if (item && item.id) map.set(item.id, item);
          }
          // Any unsynced local items
          for (const item of localItems) {
            if (item && item.id && !map.has(item.id)) {
              map.set(item.id, item);
            }
          }

          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );

          localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent(INQUIRIES_EVENT));
          return merged;
        }
      }
    }
  } catch (err) {
    console.warn('Could not sync inquiries from cloud:', err);
  }
  return getInquiriesLocally();
}

/**
 * Subscribes to project inquiries with instant reactivity and global cloud sync.
 */
export function subscribeToInquiries(
  callback: (inquiries: SubmittedBooking[]) => void
): () => void {
  // 1. Instant local data
  callback(getInquiriesLocally());

  let isCleanedUp = false;

  const triggerCloudSync = () => {
    syncInquiriesFromCloud().then((items) => {
      if (!isCleanedUp) callback(items);
    });
  };

  // Immediate cloud fetch
  triggerCloudSync();

  // Poll cloud every 8 seconds so the admin panel receives new inquiries from abroad in real time
  const interval = setInterval(triggerCloudSync, 8000);

  const handleUpdate = () => {
    if (isCleanedUp) return;
    callback(getInquiriesLocally());
  };

  const handleFocus = () => triggerCloudSync();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') triggerCloudSync();
  };

  window.addEventListener('storage', handleUpdate);
  window.addEventListener(INQUIRIES_EVENT, handleUpdate);
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    isCleanedUp = true;
    clearInterval(interval);
    window.removeEventListener('storage', handleUpdate);
    window.removeEventListener(INQUIRIES_EVENT, handleUpdate);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}

/**
 * Deletes an inquiry from LocalStorage and the global cloud store.
 */
export async function deleteInquiry(id: string): Promise<void> {
  const updated = getInquiriesLocally().filter((item) => item.id !== id);
  localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent(INQUIRIES_EVENT));

  // Also sync delete to cloud
  try {
    await fetch(CLOUD_INQUIRIES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  } catch {
    // ignore
  }
}

/**
 * Updates an inquiry status (e.g. 'new' -> 'reviewed' -> 'contacted') locally and in cloud.
 */
export async function updateInquiryStatus(
  id: string,
  status: 'new' | 'reviewed' | 'contacted'
): Promise<void> {
  const localList = getInquiriesLocally().map((item) =>
    item.id === id ? { ...item, status } : item
  );
  localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(localList));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent(INQUIRIES_EVENT));

  // Sync updated status to cloud
  try {
    await fetch(CLOUD_INQUIRIES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localList),
    });
  } catch {
    // ignore
  }
}

export function saveInquiryLocally(inquiry: SubmittedBooking) {
  try {
    const existing = getInquiriesLocally();
    const filtered = existing.filter((item) => item.id !== inquiry.id);
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify([inquiry, ...filtered]));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(INQUIRIES_EVENT));
  } catch (err) {
    console.warn('Could not save inquiry locally:', err);
  }
}

export function getInquiriesLocally(): SubmittedBooking[] {
  try {
    const raw = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Builds standard mailto URL targeting primary admin inbox
 */
export function buildMailtoUrl(to = PRIMARY_INBOX, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Builds direct Gmail web-compose URL so users without configured desktop mail clients can send directly
 */
export function buildGmailWebUrl(to = PRIMARY_INBOX, subject: string, body: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
