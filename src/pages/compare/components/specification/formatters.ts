
/**
 * Formatters for specification values
 */

// Format Wilson Score
export const formatWilsonScore = (score: number | null | undefined): string => {
  if (score === null || score === undefined || isNaN(Number(score))) return 'Not available';
  return `${Number(score).toFixed(2)}/5`;
};

// Calculate and format benchmark score
export const formatBenchmarkScore = (benchmarkScore: number | undefined): string => {
  if (benchmarkScore === undefined || benchmarkScore === 0) return 'Not available';
  return `${benchmarkScore}/100`;
};
