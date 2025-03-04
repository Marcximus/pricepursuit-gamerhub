
// Estimate release year based on processor generation
export const estimateReleaseYear = (processor?: string, title?: string): string => {
  const currentYear = new Date().getFullYear();
  
  const processToCheck = processor || title || '';
  
  // Intel processors with generation info
  const intelMatch = processToCheck.match(/i[3579]-(\d{1})(\d{3})/i);
  if (intelMatch) {
    const generation = parseInt(intelMatch[1], 10);
    if (generation >= 1 && generation <= 13) {
      // Approximate: 10th gen -> 2020, 11th gen -> 2021, etc.
      return `~${2010 + generation}`;
    }
  }
  
  // Apple Silicon
  if (processToCheck.match(/M1/i)) return '2020-2021';
  if (processToCheck.match(/M2/i)) return '2022-2023';
  if (processToCheck.match(/M3/i)) return '2023-2024';
  
  // AMD Ryzen generations
  if (processToCheck.match(/Ryzen\s+\d{4}/i)) {
    const ryzenMatch = processToCheck.match(/Ryzen\s+(\d)(\d{3})/i);
    if (ryzenMatch) {
      const generation = parseInt(ryzenMatch[1], 10);
      const year = 2016 + generation;
      return `~${year}`;
    }
  }
  
  // Default: return N/A for unknown
  return 'N/A';
};
