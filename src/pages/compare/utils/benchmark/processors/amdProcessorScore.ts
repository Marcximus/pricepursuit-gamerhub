
/**
 * Calculate score for AMD processors
 */
export function calculateAMDScore(processor: string): number {
  const proc = processor.toLowerCase();
  let score = 0;
  
  if (proc.includes('ryzen 9')) {
    if (proc.includes('8') || proc.includes('8000')) score = 88;
    else if (proc.includes('7') || proc.includes('7000')) score = 85;
    else if (proc.includes('6') || proc.includes('6000')) score = 82;
    else if (proc.includes('5') || proc.includes('5000')) score = 80;
    else if (proc.includes('4') || proc.includes('4000')) score = 75;
    else if (proc.includes('3') || proc.includes('3000')) score = 70;
    else score = 65;
  }
  else if (proc.includes('ryzen 7')) {
    if (proc.includes('8') || proc.includes('8000')) score = 85;
    else if (proc.includes('7') || proc.includes('7000')) score = 82;
    else if (proc.includes('6') || proc.includes('6000')) score = 78;
    else if (proc.includes('5') || proc.includes('5000')) score = 75;
    else if (proc.includes('4') || proc.includes('4000')) score = 70;
    else if (proc.includes('3') || proc.includes('3000')) score = 65;
    else score = 60;
  }
  else if (proc.includes('ryzen 5')) {
    if (proc.includes('8') || proc.includes('8000')) score = 80;
    else if (proc.includes('7') || proc.includes('7000')) score = 78;
    else if (proc.includes('6') || proc.includes('6000')) score = 75;
    else if (proc.includes('5') || proc.includes('5000')) score = 72;
    else if (proc.includes('4') || proc.includes('4000')) score = 68;
    else if (proc.includes('3') || proc.includes('3000')) score = 65;
    else score = 60;
  }
  else if (proc.includes('ryzen 3')) {
    if (proc.includes('8') || proc.includes('8000')) score = 70;
    else if (proc.includes('7') || proc.includes('7000')) score = 68;
    else if (proc.includes('6') || proc.includes('6000')) score = 65;
    else if (proc.includes('5') || proc.includes('5000')) score = 62;
    else if (proc.includes('4') || proc.includes('4000')) score = 58;
    else if (proc.includes('3') || proc.includes('3000')) score = 55;
    else score = 50;
  }
  
  return score;
}
