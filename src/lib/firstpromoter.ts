export const FPR_COOKIE = "fpr";
export const FPR_QUERY = "fpr";

/** Cookie max-age: 90 days (typical affiliate attribution window). */
export const FPR_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

export function parseAffiliateRef(value: string | null | undefined) {
  if (!value) return null;
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > 128) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) return null;
  return cleaned;
}
