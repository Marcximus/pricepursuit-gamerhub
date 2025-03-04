
// Extract operating system from title
export const formatOS = (title?: string): string => {
  if (title) {
    if (title.match(/Windows\s+11/i)) return 'Windows 11';
    if (title.match(/Windows\s+10/i)) return 'Windows 10';
    if (title.match(/macOS|Mac\s+OS/i)) return 'macOS';
    if (title.match(/ChromeOS|Chrome\s+OS/i)) return 'ChromeOS';
    if (title.match(/Linux/i)) return 'Linux';
  }
  
  return 'Not Specified';
};
