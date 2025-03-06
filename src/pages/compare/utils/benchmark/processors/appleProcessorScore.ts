
/**
 * Calculate score for Apple processors
 */
export function calculateAppleScore(processor: string): number {
  const proc = processor.toLowerCase();
  let score = 0;
  
  if (proc.includes('m3') || proc.includes('m 3')) {
    if (proc.includes('ultra')) score = 95;
    else if (proc.includes('max')) score = 90;
    else if (proc.includes('pro')) score = 85;
    else score = 80;
  }
  else if (proc.includes('m2') || proc.includes('m 2')) {
    if (proc.includes('max')) score = 85;
    else if (proc.includes('pro')) score = 80;
    else score = 75;
  }
  else if (proc.includes('m1') || proc.includes('m 1')) {
    if (proc.includes('max')) score = 75;
    else if (proc.includes('pro')) score = 70;
    else score = 65;
  }
  
  return score;
}
