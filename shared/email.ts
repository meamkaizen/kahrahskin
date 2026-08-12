/**
 * Email validation shared by the browser form and the server routes, so the
 * two can never disagree about what counts as a valid address.
 *
 * Deliberately stricter than the HTML5 `type="email"` rule, which accepts
 * TLD-less addresses like "chiemerie321@gmail".
 */

// Local part: dot-separated atoms, so no leading/trailing/consecutive dots.
const LOCAL_PART = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;

// A single domain label: alphanumeric, hyphens allowed only inside.
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

// Top-level domain: letters only, at least two ("gmail.c" is not a real TLD).
const TLD = /^[A-Za-z]{2,}$/;

/** Trimmed and lowercased, the single form an address is stored in. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const email = value.trim();
  if (!email || email.length > 254) return false;

  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return false;

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (local.length > 64 || !LOCAL_PART.test(local)) return false;
  if (domain.length > 253) return false;

  // Requires a dot in the domain, so "chiemerie321@gmail" is rejected.
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  if (!labels.every(label => DOMAIN_LABEL.test(label))) return false;

  return TLD.test(labels[labels.length - 1]);
}
