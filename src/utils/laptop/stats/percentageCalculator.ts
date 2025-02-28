
/**
 * Calculate the percentage of a value relative to a total
 * @param value The value to calculate the percentage of
 * @param total The total value to calculate against
 * @returns The percentage as a number
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calculate the inverse percentage (100% - percentage)
 * @param value The value to calculate the percentage of
 * @param total The total value to calculate against
 * @returns The inverse percentage as a number
 */
export function calculateInversePercentage(value: number, total: number): number {
  return 100 - calculatePercentage(value, total);
}
