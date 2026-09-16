import { SubmittedBooking } from '../types';

const INQUIRIES_STORAGE_KEY = 'zolepto_submitted_inquiries';
const INQUIRIES_EVENT = 'zolepto:inquiries-changed';
const TARGET_INBOX = 'zelopte@gmail.com';

/**
 * Saves an inquiry and delivers it directly to zelopte@gmail.com.
 * Uses Formsubmit.co free AJAX endpoint for automated email inbox delivery,
 * plus local storage synchronization.
 */
export async function saveInquiry(
  inquiry: SubmittedBooking
): Promise<{ id: string; emailSent: boolean; error?: string }> {
  // 1. Save locally for instant preview & offline resilience
  saveInquiryLocally(inquiry);

  // 2. Dispatch to Formsubmit AJAX endpoint to deliver inquiry directly to zelopte@gmail.com inbox
  let emailSent = false;
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${TARGET_INBOX}`, {
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
  } catch (err) {
    console.warn('Could not auto-forward inquiry via Formsubmit:', err);
  }

  return { id: inquiry.id, emailSent };
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
 * Builds standard mailto URL targeting zelopte@gmail.com
 */
export function buildMailtoUrl(to = TARGET_INBOX, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Builds direct Gmail web-compose URL so users without configured desktop mail clients can send directly
 */
export function buildGmailWebUrl(to = TARGET_INBOX, subject: string, body: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
