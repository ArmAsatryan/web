/**
 * Human-readable labels for language / locale codes using Intl (falls back to raw tag).
 */

/** ISO 639 / BCP-47 language subtag (e.g. en, de, hy). */
export function languageCodeToLabel(code: string): string {
  const raw = code?.trim();
  if (!raw) return '';
  const tag = raw.replace(/_/g, '-');
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames !== 'undefined') {
      const dn = new Intl.DisplayNames(undefined, { type: 'language' });
      const label = dn.of(tag);
      if (label) return label;
    }
  } catch {
    // ignore
  }
  return raw;
}

/** Full locale tag (e.g. en_US, en-US) → "English (United States)" when possible. */
export function localeTagToLabel(localeTag: string): string {
  const raw = localeTag?.trim();
  if (!raw) return '';
  const normalized = raw.replace(/_/g, '-');
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.Locale !== 'undefined') {
      const loc = new Intl.Locale(normalized);
      const langDn = new Intl.DisplayNames(undefined, { type: 'language' });
      const regionDn = new Intl.DisplayNames(undefined, { type: 'region' });
      const langName = langDn.of(loc.language);
      const region = loc.region ? regionDn.of(loc.region) : null;
      if (langName && region) return `${langName} (${region})`;
      if (langName) return langName;
    }
  } catch {
    // ignore
  }
  return languageCodeToLabel(normalized);
}
