
/**
 * Security utilities for sanitizing HTML content
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 */
export function escapeHtml(unsafe: string | number | null | undefined): string {
  if (unsafe === null || unsafe === undefined) {
    return '';
  }
  
  const str = String(unsafe);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
