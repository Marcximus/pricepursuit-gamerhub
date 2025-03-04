
// Extract ports information from title
export const extractPorts = (title?: string): string => {
  const ports = [];
  
  if (!title) return 'Not Specified';
  
  if (title.match(/USB(?:-C)?\s+\d/i)) ports.push('USB');
  if (title.match(/Thunderbolt/i)) ports.push('Thunderbolt');
  if (title.match(/HDMI/i)) ports.push('HDMI');
  if (title.match(/DisplayPort|DP/i)) ports.push('DisplayPort');
  if (title.match(/Ethernet|RJ45/i)) ports.push('Ethernet');
  if (title.match(/SD\s+card|SD\s+reader/i)) ports.push('SD Card');
  
  return ports.length > 0 ? ports.join(', ') : 'Standard Ports';
};
