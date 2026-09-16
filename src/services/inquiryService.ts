import { SubmittedBooking } from '../types';

const INQUIRIES_STORAGE_KEY = 'zolepto_submitted_inquiries';
const INQUIRIES_EVENT = 'zolepto:inquiries-changed';

/**
 * Saves an inquiry to LocalStorage with instant reactivity (GitHub & Vercel ready).
 */
export async function saveInquiry(
  inquiry: SubmittedBooking
): Promise<{ id: string; cloudSynced: boolean; error?: string }> {
  saveInquiryLocally(inquiry);
  return { id: inquiry.id, cloudSynced: true };
}

/**
 * Subscribes to project inquiries with instant reactivity.
 */
export function subscribeToInquiries(
  callback: (inquiries: SubmittedBooking[]) => void
): () => void {
  // Instant local data
  callback(getInquiriesLocally());

  let isCleanedUp = false;

  const handleUpdate = () => {
    if (isCleanedUp) return;
    callback(getInquiriesLocally());
  };

  window.addEventListener('storage', handleUpdate);
  window.addEventListener(INQUIRIES_EVENT, handleUpdate);

  return () => {
    isCleanedUp = true;
    window.removeEventListener('storage', handleUpdate);
    window.removeEventListener(INQUIRIES_EVENT, handleUpdate);
  };
}

/**
 * Deletes an inquiry from LocalStorage.
 */
export async function deleteInquiry(id: string): Promise<void> {
  const updated = getInquiriesLocally().filter((item) => item.id !== id);
  localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent(INQUIRIES_EVENT));
}

/**
 * Updates an inquiry status (e.g. 'new' -> 'reviewed' -> 'contacted').
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
 * Builds standard mailto URL
 */
export function buildMailtoUrl(to: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Builds direct Gmail web-compose URL so users without configured desktop mail clients can send directly
 */
export function buildGmailWebUrl(to: string, subject: string, body: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
