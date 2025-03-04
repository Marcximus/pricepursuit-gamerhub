
// Extract refresh rate from title or screen resolution
export const extractRefreshRate = (screenResolution?: string, title?: string): string => {
  if (screenResolution && screenResolution.match(/\d+Hz/i)) {
    const match = screenResolution.match(/(\d+)Hz/i);
    if (match) return `${match[1]}Hz`;
  }
  
  if (title) {
    const match = title.match(/(\d+)\s*Hz/i);
    if (match) return `${match[1]}Hz`;
  }
  
  return 'Not Specified';
};
