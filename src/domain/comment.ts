// An optional note a buyer leaves with a rating. A happy one can become a testimony on the Ulam board,
// so it is kept short and must not carry links or phone numbers.
export const MAX_COMMENT = 140;

/** Why this comment cannot be saved, or null when it is fine. The phone and the server use the same rule. */
export function commentProblem(text: string): string | null {
  if (text.length > MAX_COMMENT) return `Keep it to ${MAX_COMMENT} characters.`;
  if (/https?:|www\.|\.(com|ph|net|org)\b|@\w/i.test(text)) return "Please leave out links and handles.";
  if (/\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d/.test(text)) return "Please leave out phone numbers.";
  return null;
}

/** Trimmed text, or null when empty. */
export const cleanComment = (text: string) => text.replace(/\s+/g, " ").trim() || null;
