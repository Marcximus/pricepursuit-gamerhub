
/**
 * Utility functions for consistent logging throughout the application
 */

/**
 * Logs memory usage statistics to help with debugging
 */
export const logMemoryUsage = () => {
  try {
    const memoryUsage = Deno.memoryUsage();
    console.error('Memory usage:', {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    });
  } catch (memError) {
    console.error('Could not log memory usage:', memError);
  }
};

/**
 * Safely stringifies objects without circular reference issues
 * @param obj Any object to stringify
 * @returns String representation of the object
 */
export const safeStringify = (obj: any): string => {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular Reference]";
        }
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (error) {
    return `[Error stringifying object: ${error.message}]`;
  }
};
