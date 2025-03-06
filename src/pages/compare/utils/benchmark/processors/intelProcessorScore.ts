
/**
 * Calculate score for Intel processors
 */
export function calculateIntelScore(processor: string): number {
  const proc = processor.toLowerCase();
  let score = 0;
  
  // Intel Core Ultra (newest series)
  if (proc.includes('core ultra') || proc.includes('intel ultra')) {
    if (proc.includes('9')) score = 95;
    else if (proc.includes('7')) score = 93;
    else if (proc.includes('5')) score = 91;
    else score = 90; // Generic Ultra
  }
  // Intel Core generations
  else if (proc.includes('i9')) {
    if (proc.includes('14') || proc.includes('15') || proc.includes('14th') || proc.includes('15th')) score = 88;
    else if (proc.includes('13') || proc.includes('13th')) score = 85;
    else if (proc.includes('12') || proc.includes('12th')) score = 82;
    else if (proc.includes('11') || proc.includes('11th')) score = 78;
    else if (proc.includes('10') || proc.includes('10th')) score = 75;
    else if (proc.includes('9th') || proc.includes('9') || proc.includes('8th') || proc.includes('8')) score = 70;
    else score = 65;
  }
  else if (proc.includes('i7')) {
    if (proc.includes('14') || proc.includes('15') || proc.includes('14th') || proc.includes('15th')) score = 85;
    else if (proc.includes('13') || proc.includes('13th')) score = 82;
    else if (proc.includes('12') || proc.includes('12th')) score = 78;
    else if (proc.includes('11') || proc.includes('11th')) score = 75;
    else if (proc.includes('10') || proc.includes('10th')) score = 72;
    else if (proc.includes('9th') || proc.includes('9') || proc.includes('8th') || proc.includes('8')) score = 68;
    else score = 65;
  }
  else if (proc.includes('i5')) {
    if (proc.includes('14') || proc.includes('15') || proc.includes('14th') || proc.includes('15th')) score = 80;
    else if (proc.includes('13') || proc.includes('13th')) score = 78;
    else if (proc.includes('12') || proc.includes('12th')) score = 75;
    else if (proc.includes('11') || proc.includes('11th')) score = 72;
    else if (proc.includes('10') || proc.includes('10th')) score = 68;
    else if (proc.includes('9th') || proc.includes('9') || proc.includes('8th') || proc.includes('8')) score = 65;
    else score = 60;
  }
  else if (proc.includes('i3')) {
    if (proc.includes('14') || proc.includes('15') || proc.includes('14th') || proc.includes('15th')) score = 70;
    else if (proc.includes('13') || proc.includes('13th')) score = 68;
    else if (proc.includes('12') || proc.includes('12th')) score = 65;
    else if (proc.includes('11') || proc.includes('11th')) score = 62;
    else if (proc.includes('10') || proc.includes('10th')) score = 58;
    else if (proc.includes('9th') || proc.includes('9') || proc.includes('8th') || proc.includes('8')) score = 55;
    else score = 50;
  }
  
  // Budget processors
  else if (proc.includes('pentium')) {
    if (proc.includes('gold')) score = 45;
    else if (proc.includes('silver')) score = 40;
    else score = 35;
  }
  else if (proc.includes('celeron')) {
    if (proc.includes('n5') || proc.includes('n6')) score = 35;
    else if (proc.includes('n4')) score = 30;
    else score = 25;
  }
  
  return score;
}
