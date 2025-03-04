
import { samsungPatterns } from '../processorPatterns';

/**
 * Extracts Samsung Exynos processors from a laptop title
 */
export const extractSamsungProcessor = (normalizedTitle: string): string | null => {
  // Try to extract Exynos
  const exynosMatch = normalizedTitle.match(samsungPatterns.exynos);
  if (exynosMatch) {
    return `Samsung Exynos ${exynosMatch[1]}`;
  }
  
  return null;
};
