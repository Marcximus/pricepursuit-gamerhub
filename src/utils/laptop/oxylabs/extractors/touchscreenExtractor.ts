
/**
 * Detect if the laptop has a touchscreen
 */
export function extractTouchscreen(content: any): boolean | null {
  const textToSearch = [
    content.title || '',
    content.bullet_points || '',
    content.description || ''
  ].join(' ');
  
  const touchscreenPatterns = [
    /touchscreen/i,
    /touch\s+screen/i,
    /touch\s+display/i,
    /touch\s+enabled/i
  ];
  
  for (const pattern of touchscreenPatterns) {
    if (pattern.test(textToSearch)) {
      return true;
    }
  }
  
  // Only return false if we're confident (e.g., when it specifically says non-touch)
  if (/non[\-\s]touch/i.test(textToSearch)) {
    return false;
  }
  
  return null; // Return null if uncertain
}
