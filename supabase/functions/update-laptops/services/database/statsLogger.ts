
import { UpdateResult, UpdateStats } from "../../types.ts";

/**
 * Log statistics about update operations
 */
export function logUpdateStats(results: UpdateResult[]): UpdateStats {
  const stats: UpdateStats = {
    total: results.length,
    successful: 0,
    failed: 0,
    priceUpdated: 0,
    imageUpdated: 0,
    specsUpdated: 0
  };
  
  results.forEach(result => {
    if (result.success) {
      stats.successful++;
      if (result.priceUpdated) stats.priceUpdated++;
      if (result.imageUpdated) stats.imageUpdated++;
      if (result.specsUpdated) stats.specsUpdated++;
    } else {
      stats.failed++;
    }
  });
  
  console.log(`Update statistics: ${stats.successful}/${stats.total} successful (${stats.priceUpdated} prices, ${stats.imageUpdated} images, ${stats.specsUpdated} specs updated)`);
  
  return stats;
}
