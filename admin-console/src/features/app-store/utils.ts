import type { AppStoreLocaleOption } from './types';

/** App Store specific formatting helpers, kept separate from per-page concerns. */

/**
 * Maps an App Store locale code to the catalog language name from the backend
 * (e.g. {@code en-US} → {@code English (US)}). Falls back to a readable code if unknown.
 */
export function localeDisplayName(
  locale: string | undefined | null,
  catalog?: readonly AppStoreLocaleOption[] | null,
): string {
  if (!locale) return '—';
  const hit = catalog?.find((e) => e.locale === locale);
  if (hit?.language) return hit.language;
  return humanizeLocaleCode(locale);
}

function humanizeLocaleCode(locale: string): string {
  try {
    const normalized = locale.replace(/_/g, '-');
    const dn = new Intl.DisplayNames(['en'], { type: 'language' });
    const label = dn.of(normalized);
    if (label) return label;
  } catch {
    /* Intl may throw on invalid tags in older engines */
  }
  return locale.replace(/_/g, '-');
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

/** Returns a human-readable label + semantic severity for an App Store state. */
export function appStoreStateLabel(state?: string): { label: string; color: 'default' | 'info' | 'success' | 'warning' | 'error' } {
  if (!state) return { label: '—', color: 'default' };
  switch (state) {
    case 'PREPARE_FOR_SUBMISSION':
      return { label: 'Prepare for Submission', color: 'info' };
    case 'WAITING_FOR_REVIEW':
    case 'IN_REVIEW':
    case 'PENDING_DEVELOPER_RELEASE':
    case 'PENDING_APPLE_RELEASE':
      return { label: humanize(state), color: 'warning' };
    case 'READY_FOR_SALE':
    case 'APPROVED':
      return { label: humanize(state), color: 'success' };
    case 'REJECTED':
    case 'METADATA_REJECTED':
    case 'DEVELOPER_REJECTED':
    case 'INVALID_BINARY':
      return { label: humanize(state), color: 'error' };
    default:
      return { label: humanize(state), color: 'default' };
  }
}

function humanize(state: string): string {
  return state
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
