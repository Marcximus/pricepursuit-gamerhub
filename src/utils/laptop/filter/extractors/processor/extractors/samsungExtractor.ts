
import { Pattern } from '../processorPatterns';

/**
 * Pattern for Samsung Exynos processors
 */
const samsungPattern: Pattern = {
  exynos: /exynos\s*(\d+)/i
};

/**
 * Extracts Samsung Exynos processors from a laptop title
 */
export const extractSamsungProcessor = (normalizedTitle: string): string | null => {
  // Try to extract Exynos
  const exynosMatch = normalizedTitle.match(samsungPattern.exynos);
  if (exynosMatch) {
    return `Samsung Exynos ${exynosMatch[1]}`;
  }
  
  return null;
};
