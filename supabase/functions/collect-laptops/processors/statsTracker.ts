
/**
 * Statistics tracker for product processing
 */
export interface ProcessingStats {
  processed: number;
  updated: number;
  added: number;
  failed: number;
}

/**
 * Creates a new stats object with zero values
 */
export function createInitialStats(): ProcessingStats {
  return {
    processed: 0,
    updated: 0,
    added: 0,
    failed: 0
  };
}

/**
 * Combines two stats objects
 * @param base Base stats object
 * @param additional Stats to add
 * @returns Combined stats
 */
export function combineStats(base: ProcessingStats, additional: ProcessingStats): ProcessingStats {
  return {
    processed: base.processed + additional.processed,
    updated: base.updated + additional.updated,
    added: base.added + additional.added,
    failed: base.failed + additional.failed
  };
}

/**
 * Updates stats based on database operation results
 * @param stats Stats object to update
 * @param dbResults Database operation results
 * @returns Updated stats
 */
export function updateStatsFromDbResults(
  stats: ProcessingStats, 
  dbResults: { updated: number; added: number; failed: number }
): ProcessingStats {
  return {
    ...stats,
    updated: stats.updated + dbResults.updated,
    added: stats.added + dbResults.added,
    failed: stats.failed + dbResults.failed
  };
}
