import { SubmittedBooking } from '../types';

const INQUIRIES_STORAGE_KEY = 'zolepto_submitted_inquiries';
const INQUIRIES_EVENT = 'zolepto:inquiries-changed';
const PRIMARY_INBOX = 'cheddarc19@gmail.com';
const SECONDARY_INBOX = 'zelopte@gmail.com';
const CLOUD_INQUIRIES_ENDPOINT = 'https://kvdb.io/NpJTZs8GERZzanmJpGY1FL/inquiries';

/**
 * Saves an inquiry to the persistent global cloud store so it immediately reflects
 * on the Admin Panel on PC across countries, and dispatches email notifications.
 */
export async function saveInquiry(
  inquiry: SubmittedBooking
): Promise<{ id: string; emailSent: boolean; cloudSynced: boolean; error?: string }> {
  // 1. Save locally for instant preview & offline resilience
  saveInquiryLocally(inquiry);

  // 2. Persist to Global Cloud Store (accessible across devices, phones, and countries)
  let cloudSynced = false;
  try {
    // Fetch existing remote list
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
      // If get fails or is empty, start fresh
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

  // 3. Dispatch to Formsubmit AJAX endpoints for email delivery
  let emailSent = false;
  const dispatchEmail = async (inbox: string) => {
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${inbox}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `New Portfolio Inquiry [${inquiry.id}] — ${inquiry.fullName}`,
          _replyto: inquiry.email,
          _template: 'table',
          'Client Name': inquiry.fullName,
          'Client Email': inquiry.email,
          'Project Scope': inquiry.projectType,
          'Estimated Budget': inquiry.estimatedBudget || 'To be discussed',
          'Reference Links': inquiry.links || 'None',
          'Project Brief': inquiry.brief || 'None provided',
          'Inquiry Reference ID': inquiry.id,
          'Submitted At': inquiry.submittedAt,
        }),
      });
      if (res.ok) {
        emailSent = true;
      }
    } catch {
      // silent catch for secondary
    }
  };

  await Promise.allSettled([
    dispatchEmail(PRIMARY_INBOX),
    dispatchEmail(SECONDARY_INBOX),
  ]);

  return { id: inquiry.id, emailSent, cloudSynced };
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

  // Poll cloud every 10 seconds so the admin panel receives new inquiries from abroad in real time
  const interval = setInterval(triggerCloudSync, 10000);

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
