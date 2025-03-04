
/**
 * Common types and utilities for graphics card filters
 */

// Common patterns for extracting GPU model numbers
export const extractModelNumber = (normalized: string, pattern: RegExp): string | null => {
  const match = normalized.match(pattern);
  return match ? match[1] : null;
};

// Type for GPU category mapping
export type GPUCategory = {
  name: string;
  priority: number;
};
