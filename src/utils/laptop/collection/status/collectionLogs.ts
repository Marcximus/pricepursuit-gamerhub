
import { CollectionStats } from "../../types";

/**
 * Log batch processing status
 * @param batchNumber Current batch number
 * @param totalBatches Total number of batches
 * @param batchBrands Brands in the current batch
 */
export function logBatchStatus(batchNumber: number, totalBatches: number, batchBrands: string[]) {
  console.log(`\n🔄 Processing batch ${batchNumber}/${totalBatches}`);
  console.log(`🏷️ Brands in this batch: ${batchBrands.join(', ')}`);
  console.log(`⏱️ Started at: ${new Date().toLocaleTimeString()}`);
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
  } else {
    console.log('🚀 STARTING NEW LAPTOP COLLECTION');
  }
  
  console.log(`📚 Total brands to process: ${totalBrands}`);
  console.log(`⏱️ Started at: ${new Date().toLocaleString()}`);
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
  
  console.log('\n===========================================');
  console.log('🎉 LAPTOP COLLECTION COMPLETED!');
  console.log(`⏱️ Total duration: ${minutes}m ${seconds}s`);
  console.log(`📊 Final stats:`);
  console.log(`  ✅ Processed: ${stats.processed}`);
  console.log(`  🆕 Added: ${stats.added}`);
  console.log(`  🔄 Updated: ${stats.updated}`);
  console.log(`  ❌ Failed: ${stats.failed}`);
  console.log(`  ⏭️ Skipped: ${stats.skipped || 0}`);
  console.log(`⏱️ Completed at: ${new Date().toLocaleString()}`);
  console.log('===========================================\n');
}
