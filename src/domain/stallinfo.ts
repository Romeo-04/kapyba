// What a karinderya tells its customers. Free text, so it follows the same rule as a comment:
// no links, handles or phone numbers on a public page.
export const MAX_ABOUT = 240;
export const MAX_HOURS = 80;

/** Why this text cannot be saved, or null when it is fine. The phone and the server use the same rule. */
export function infoProblem(text: string, max: number): string | null {
  if (text.length > max) return `Keep it to ${max} characters.`;
  if (/https?:|www\.|\.(com|ph|net|org)|@\w/i.test(text)) return "Please leave out links and handles.";
  if (/\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d[\s-]?\d/.test(text)) return "Please leave out phone numbers.";
  return null;
}
