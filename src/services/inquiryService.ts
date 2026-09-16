import { SubmittedBooking } from '../types';

const INQUIRIES_STORAGE_KEY = 'zolepto_submitted_inquiries';
const INQUIRIES_EVENT = 'zolepto:inquiries-changed';
export const PRIMARY_INBOX = 'cheddarc19@gmail.com';
export const SECONDARY_INBOX = 'zelopte@gmail.com';

// Primary & Secondary resilient cloud synchronization endpoints
const CLOUD_INQUIRIES_ENDPOINT = 'https://kvdb.io/NpJTZs8GERZzanmJpGY1FL/inquiries';

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

/**
 * Dispatches the inquiry via browser background fallback iframe form
 * Native HTML form posts are NEVER blocked by CORS or adblockers.
 */
function dispatchNativeBackgroundForm(inbox: string, inquiry: SubmittedBooking) {
  try {
    if (typeof document === 'undefined') return;

    let sinkFrame = document.getElementById('zolepto-inquiry-sink') as HTMLIFrameElement;
    if (!sinkFrame) {
      sinkFrame = document.createElement('iframe');
      sinkFrame.id = 'zolepto-inquiry-sink';
      sinkFrame.name = 'zolepto-inquiry-sink';
      sinkFrame.style.display = 'none';
      document.body.appendChild(sinkFrame);
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://formsubmit.co/${inbox}`;
    form.target = 'zolepto-inquiry-sink';
    form.style.display = 'none';

    const fields: Record<string, string> = {
      _subject: `New Project Inquiry [${inquiry.id}] — ${inquiry.fullName}`,
      _replyto: inquiry.email,
      _captcha: 'false',
      _template: 'table',
      name: inquiry.fullName,
      email: inquiry.email,
      project_scope: inquiry.projectType,
      budget: inquiry.estimatedBudget || 'Flexible',
      brief: inquiry.brief || 'None',
      links: inquiry.links || 'None',
      inquiry_id: inquiry.id,
      submitted_at: inquiry.submittedAt,
    };

    for (const [k, v] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = k;
      input.value = v;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    setTimeout(() => {
      try {
        form.remove();
      } catch {}
    }, 2000);
  } catch (e) {
    // Non-blocking fallback
  }
}

/**
 * Saves an inquiry to the persistent global cloud store so it immediately reflects
 * on the Admin Panel on PC across devices, dispatches to webhooks, and forwards emails.
 */
export async function saveInquiry(
  inquiry: SubmittedBooking,
  customWebhookUrl?: string
): Promise<{ id: string; emailSent: boolean; cloudSynced: boolean; webhookSent: boolean; error?: string }> {
  // 1. Save locally for immediate display
  saveInquiryLocally(inquiry);

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

    const filtered = remoteList.filter((item) => item.id !== inquiry.id);
    const updatedRemote = [inquiry, ...filtered];

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
      webhookSent = await dispatchWebhookNotification(customWebhookUrl, inquiry);
    } catch {
      // non-blocking
    }
  }

  // 4. Multi-channel background email dispatch
  let emailSent = false;

  // Method A: Formsubmit AJAX endpoint with urlencoded data + _captcha=false
  const dispatchAjaxEmail = async (inbox: string) => {
    try {
      const params = new URLSearchParams({
        _subject: `New Portfolio Inquiry [${inquiry.id}] — ${inquiry.fullName}`,
        _replyto: inquiry.email,
        _captcha: 'false',
        _template: 'table',
        'Client Name': inquiry.fullName,
        'Client Email': inquiry.email,
        'Project Scope': inquiry.projectType,
        'Estimated Budget': inquiry.estimatedBudget || 'Flexible',
        'Reference Links': inquiry.links || 'None',
        'Project Brief': inquiry.brief || 'None provided',
        'Inquiry ID': inquiry.id,
        'Submitted At': inquiry.submittedAt,
      });

      const res = await fetch(`https://formsubmit.co/ajax/${inbox}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: params.toString(),
      });

      if (res.ok) {
        emailSent = true;
      }
    } catch {
      // Continue to next method
    }
  };

  // Method B: Web3Forms fallback dispatch
  const dispatchWeb3Forms = async () => {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: '64d852a4-5696-414c-a11b-10f845dca889', // Reliable public key for inquiries
          subject: `New Portfolio Inquiry [${inquiry.id}] — ${inquiry.fullName}`,
          from_name: inquiry.fullName,
          replyto: inquiry.email,
          message: `Inquiry ID: ${inquiry.id}\nClient: ${inquiry.fullName}\nEmail: ${inquiry.email}\nScope: ${inquiry.projectType}\nBudget: ${inquiry.estimatedBudget}\nLinks: ${inquiry.links || 'None'}\n\nBrief:\n${inquiry.brief || 'None'}`,
        }),
      });
      if (res.ok) {
        emailSent = true;
      }
    } catch {
      // Non-blocking
    }
  };

  // Run AJAX email dispatches in parallel
  await Promise.allSettled([
    dispatchAjaxEmail(PRIMARY_INBOX),
    dispatchAjaxEmail(SECONDARY_INBOX),
    dispatchWeb3Forms(),
  ]);

  // Method C: Native browser invisible iframe form dispatch (immunized against CORS & tracking blocks)
  try {
    dispatchNativeBackgroundForm(PRIMARY_INBOX, inquiry);
  } catch {}

  return { id: inquiry.id, emailSent, cloudSynced, webhookSent };
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
