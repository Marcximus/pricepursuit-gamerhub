
/**
 * Utility functions to assist with laptop data retrieval and processing
 */

/**
 * Format a date to a human-readable string
 * @param isoDate ISO date string to format
 * @returns Formatted date string
 */
export const formatDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return 'Never';
  
  try {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

/**
 * Format a price to a human-readable string
 * @param price Price to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
};

/**
 * Check if an object has all required fields
 * @param obj Object to check
 * @param fields Array of field names to check
 * @returns True if all fields exist and are non-null/undefined
 */
export const hasRequiredFields = (obj: any, fields: string[]): boolean => {
  if (!obj) return false;
  
  return fields.every(field => {
    return obj[field] !== null && obj[field] !== undefined;
  });
};

/**
 * Create a delay using promises
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate a random delay within a range
 * @param min Minimum delay in milliseconds
 * @param max Maximum delay in milliseconds
 * @returns Promise that resolves after a random delay
 */
export const randomDelay = (min: number, max: number): Promise<void> => {
  const delayMs = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(delayMs);
};
