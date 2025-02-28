
/**
 * Calculate percentage of count relative to total
 */
export function calculatePercentage(count: number, totalCount: number): number {
  return totalCount ? Math.round((count / totalCount) * 100) : 0;
}

/**
 * Calculate inverse percentage (percentage of items NOT in the count)
 */
export function calculateInversePercentage(count: number, totalCount: number): number {
  return totalCount ? Math.round(((totalCount - count) / totalCount) * 100) : 0;
}
