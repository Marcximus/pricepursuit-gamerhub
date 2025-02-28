
import { CollectionStats } from "../../types";

/**
 * Log batch processing status
 * @param batchNumber Current batch number
 * @param totalBatches Total number of batches
 * @param batchBrands Brands in the current batch
 */
export function logBatchStatus(batchNumber: number, totalBatches: number, batchBrands: string[]) {
  const emoji = getProgressEmoji(batchNumber, totalBatches);
  console.log(`\n${emoji} Processing batch ${batchNumber}/${totalBatches} (${Math.round((batchNumber/totalBatches)*100)}% complete)`);
  console.log(`🏷️ Brands in this batch: ${batchBrands.join(', ')}`);
  console.log(`⏱️ Started at: ${new Date().toLocaleTimeString()}`);
  console.log(`🧠 Expected completion: ~${Math.round(batchBrands.length * 2.5)} minutes`);
  console.log(`💼 Parallel processing: ${batchBrands.length} brands simultaneously`);
  console.log('-------------------------------------------');
}

/**
 * Log collection start information
 * @param totalBrands Total number of brands
 * @param isResuming Whether the collection is being resumed
 * @param fromGroup Starting group index
 * @param fromBrand Starting brand index
 */
export function logCollectionStart(totalBrands: number, isResuming: boolean, fromGroup: number = 0, fromBrand: number = 0) {
  console.log('\n===========================================');
  
  if (isResuming) {
    console.log(`🔄 RESUMING LAPTOP COLLECTION from Group ${fromGroup + 1}, Brand ${fromBrand + 1}`);
    console.log(`🔍 Picking up from where we left off`);
    const percentComplete = Math.round(((fromGroup * totalBrands + fromBrand) / totalBrands) * 100);
    console.log(`📊 Progress: ~${percentComplete}% already completed`);
  } else {
    console.log('🚀 STARTING NEW LAPTOP COLLECTION');
    console.log('🧹 Fresh collection, starting from scratch');
  }
  
  console.log(`📚 Total brands to process: ${totalBrands}`);
  console.log(`⏱️ Started at: ${new Date().toLocaleString()}`);
  console.log(`⚙️ System info: ${navigator.userAgent}`);
  
  // Estimate completion time
  const estimatedMinutes = Math.round(totalBrands * 2.5);
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;
  console.log(`⏳ Estimated completion time: ${hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''} ` : ''}${minutes} minute${minutes !== 1 ? 's' : ''}`);
  
  console.log('===========================================\n');
}

/**
 * Log collection completion
 * @param startTime Start time of the collection
 * @param stats Final collection statistics
 */
export function logCollectionCompletion(startTime: Date, stats: CollectionStats) {
  const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  console.log('\n===========================================');
  console.log('🎉 LAPTOP COLLECTION COMPLETED!');
  console.log(`⏱️ Total duration: ${hours > 0 ? `${hours}h ` : ''}${remainingMinutes}m ${seconds}s`);
  
  // Calculate processing rate
  const totalProcessed = stats.processed || 0;
  const processingRate = totalProcessed > 0 ? Math.round(totalProcessed / (duration / 60)) : 0;
  
  console.log(`⚡ Processing rate: ~${processingRate} products per minute`);
  console.log(`📊 Final stats:`);
  console.log(`  ✅ Processed: ${stats.processed}`);
  console.log(`  🆕 Added: ${stats.added}`);
  console.log(`  🔄 Updated: ${stats.updated}`);
  console.log(`  ❌ Failed: ${stats.failed}`);
  console.log(`  ⏭️ Skipped: ${stats.skipped || 0}`);
  
  // Calculate success rate
  const successRate = Math.round(((stats.added + stats.updated) / (stats.processed || 1)) * 100);
  const successEmoji = successRate >= 90 ? '🌟' : successRate >= 75 ? '✨' : successRate >= 50 ? '👍' : '⚠️';
  
  console.log(`  ${successEmoji} Success rate: ${successRate}%`);
  console.log(`⏱️ Completed at: ${new Date().toLocaleString()}`);
  console.log('===========================================\n');
}

/**
 * Get appropriate emoji based on progress
 * @param current Current step
 * @param total Total steps
 * @returns Emoji representing progress
 */
function getProgressEmoji(current: number, total: number): string {
  const progress = current / total;
  
  if (progress < 0.25) return '🟢';
  if (progress < 0.50) return '🟡';
  if (progress < 0.75) return '🟠';
  if (progress < 1) return '🔴';
  return '✅';
}
