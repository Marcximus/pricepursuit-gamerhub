
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { CollectionProgressData, CollectionStats } from "../types";

/**
 * Reset any stale collection processes (those that have been "in_progress" for too long)
 * @param staleTimeout ISO date string representing the cutoff time for stale processes
 */
export async function resetStaleCollections(staleTimeout: string) {
  console.log('🧹 Cleaning up stale collection processes...');
  
  const { error: cleanupError } = await supabase
    .from('products')
    .update({ collection_status: 'pending' })
    .eq('collection_status', 'in_progress')
    .lt('last_collection_attempt', staleTimeout);

  if (cleanupError) {
    console.error('❌ Error cleaning up stale statuses:', cleanupError);
    throw cleanupError;
  }
  
  console.log('✅ Stale collection cleanup completed');
}

/**
 * Check if there are any active collections currently in progress
 * @param staleTimeout ISO date string representing the cutoff time for stale processes
 * @returns Array of active collection records
 */
export async function checkActiveCollections(staleTimeout: string) {
  console.log('🔍 Checking for active collection processes...');
  
  const { data: activeCollections, error: statusError } = await supabase
    .from('products')
    .select('collection_status, last_collection_attempt')
    .eq('collection_status', 'in_progress')
    .gt('last_collection_attempt', staleTimeout)
    .limit(1);

  if (statusError) {
    console.error('❌ Status check error:', statusError);
    throw statusError;
  }
  
  if (activeCollections && activeCollections.length > 0) {
    console.log('⚠️ Found active collection in progress');
  } else {
    console.log('✅ No active collections in progress');
  }

  return activeCollections;
}

/**
 * Update the collection status for a specific brand
 * @param brand Brand name to update
 * @param status New status ('in_progress', 'completed', or 'pending')
 */
export async function updateBrandStatus(brand: string, status: 'in_progress' | 'completed' | 'pending') {
  console.log(`🔄 Updating status for ${brand} to: ${status}`);
  
  const updateData = {
    collection_status: status,
    ...(status === 'in_progress' ? { last_collection_attempt: new Date().toISOString() } : {})
  };

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('brand', brand);

  if (error) {
    console.error(`❌ Error updating brand status for ${brand}:`, error);
    throw error;
  }
  
  console.log(`✅ Status for ${brand} updated to: ${status}`);
}

/**
 * Save the current progress of collection to the database
 * @param groupIndex Current group index
 * @param brandIndex Current brand index
 * @param stats Current collection statistics
 * @param isComplete Whether collection is complete
 */
export async function saveCollectionProgress(
  groupIndex: number, 
  brandIndex: number, 
  stats: CollectionStats,
  isComplete: boolean = false
) {
  try {
    // Create the progress data object (or null if collection is complete)
    // Using type assertion to ensure compatibility with Json type
    const progressData = isComplete ? null : {
      groupIndex,
      brandIndex,
      timestamp: new Date().toISOString(),
      stats: {
        processed: stats.processed,
        updated: stats.updated,
        added: stats.added,
        failed: stats.failed,
        skipped: stats.skipped
      }
    } as Json;
    
    // Use a fixed UUID for the ID field
    const progressId = '7c75e6fe-c6b3-40be-9378-e44c8f45787d';
    
    // Create the record to upsert
    const record = {
      id: progressId,
      progress_data: progressData,
      last_updated: new Date().toISOString(),
      progress_type: 'laptop_collection' 
    };
    
    if (isComplete) {
      console.log('🏁 Collection complete! Saving final progress...');
    } else {
      console.log(`📊 Saving progress - Group: ${groupIndex + 1}, Brand: ${brandIndex + 1}`);
      console.log(`📈 Current stats: Processed: ${stats.processed}, Added: ${stats.added}, Updated: ${stats.updated}, Failed: ${stats.failed}, Skipped: ${stats.skipped}`);
    }
    
    const { error } = await supabase
      .from('collection_progress')
      .upsert(record);
      
    if (error) {
      console.error('❌ Error saving collection progress:', error);
    } else {
      console.log('✅ Collection progress saved successfully');
    }
  } catch (e) {
    console.error('❌ Error in saveCollectionProgress:', e);
  }
}

/**
 * Get the last saved collection progress from the database
 * @returns The last saved progress data, or null if none exists
 */
export async function getLastCollectionProgress() {
  try {
    console.log('🔍 Checking for previous collection progress...');
    
    const { data, error } = await supabase
      .from('collection_progress')
      .select('*')
      .eq('id', '7c75e6fe-c6b3-40be-9378-e44c8f45787d')
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ No previous collection progress found, starting fresh');
        return null;
      }
      console.error('❌ Error fetching collection progress:', error);
      return null;
    }
    
    if (data && data.progress_data) {
      const progressData = data.progress_data as any;
      console.log(`🔄 Found previous progress - Group: ${progressData.groupIndex + 1}, Brand: ${progressData.brandIndex + 1}`);
      if (progressData.stats) {
        console.log(`📊 Previous stats: Processed: ${progressData.stats.processed}, Added: ${progressData.stats.added}, Updated: ${progressData.stats.updated}, Failed: ${progressData.stats.failed}, Skipped: ${progressData.stats.skipped || 0}`);
      }
    }
    
    return data;
  } catch (e) {
    console.error('❌ Error in getLastCollectionProgress:', e);
    return null;
  }
}

/**
 * Log product update details with enhanced specification extraction information
 * @param product Product being updated
 * @param isNew Whether this is a new product or an update
 * @param extracted Optional information about extracted data
 */
export function logProductDetails(product: any, isNew: boolean, extracted?: any) {
  const operation = isNew ? 'Added' : 'Updated';
  const emoji = isNew ? '🆕' : '🔄';
  
  console.log(`${emoji} ${operation} product: ASIN=${product.asin}`);
  console.log(`  📝 Title: ${product.title?.substring(0, 100)}${product.title?.length > 100 ? '...' : ''}`);
  
  // Calculate completion percentage of specs extracted
  const specFields = ['brand', 'model', 'processor', 'ram', 'storage', 'graphics', 'screen_size', 'screen_resolution'];
  const availableSpecs = specFields.filter(field => product[field] && product[field].toString().trim() !== '').length;
  const specCompletionPercent = Math.round((availableSpecs / specFields.length) * 100);
  
  console.log(`  🧮 Specs completion: ${specCompletionPercent}% (${availableSpecs}/${specFields.length} fields)`);
  
  if (product.brand) console.log(`  🏷️ Brand: ${product.brand}`);
  if (product.model) console.log(`  📱 Model: ${product.model}`);
  if (product.current_price) console.log(`  💰 Price: $${product.current_price}`);
  if (product.processor) {
    console.log(`  🧠 Processor: ${product.processor}`);
  } else {
    console.log(`  ❌ Processor: Not extracted from title "${product.title}"`);
  }
  if (product.ram) {
    console.log(`  🧮 RAM: ${product.ram}`);
  } else {
    console.log(`  ❌ RAM: Not extracted from title "${product.title}"`);
  } 
  if (product.storage) {
    console.log(`  💾 Storage: ${product.storage}`);
  } else {
    console.log(`  ❌ Storage: Not extracted from title "${product.title}"`);
  }
  if (product.graphics) {
    console.log(`  🎮 Graphics: ${product.graphics}`);
  } else {
    console.log(`  ❌ Graphics: Not extracted from title "${product.title}"`);
  }
  if (product.screen_size) {
    console.log(`  📱 Screen: ${product.screen_size}`);
  } else {
    console.log(`  ❌ Screen size: Not extracted from title "${product.title}"`);
  }
  if (product.screen_resolution) {
    console.log(`  🖥️ Resolution: ${product.screen_resolution}`);
  }
  if (product.rating && product.rating_count) console.log(`  ⭐ Rating: ${product.rating}/5 (${product.rating_count} reviews)`);
  
  // If we have extraction data, show attempts vs success
  if (extracted) {
    console.log(`  📊 Extraction details:`);
    Object.entries(extracted).forEach(([key, value]) => {
      const success = value !== null && value !== undefined && value !== '';
      console.log(`    ${success ? '✅' : '❌'} ${key}: ${success ? value : 'Failed to extract'}`);
    });
  }
  
  console.log(`  ⏱️ Processed at: ${new Date().toLocaleTimeString()}`);
}

/**
 * Process a page of products for a specific brand
 * @param brand Brand name
 * @param page Page number
 * @param groupIndex Current group index
 * @param brandIndex Current brand index within group
 * @param totalBrands Total number of brands
 * @returns Processing result with stats
 */
export async function processPage(
  brand: string,
  page: number,
  groupIndex: number,
  brandIndex: number,
  totalBrands: number
) {
  try {
    console.log(`🔍 Processing ${brand} page ${page} (Group ${groupIndex + 1}, Brand ${brandIndex + 1}/${totalBrands})`);
    
    // In a real implementation, this would fetch product data from an API
    // and process it, but for this example we'll just simulate some results
    const stats = {
      processed: Math.floor(Math.random() * 10) + 5,
      updated: Math.floor(Math.random() * 3),
      added: Math.floor(Math.random() * 5),
      failed: Math.floor(Math.random() * 2),
      skipped: Math.floor(Math.random() * 3)
    };
    
    console.log(`📊 Page ${page} stats: Processed: ${stats.processed}, Added: ${stats.added}, Updated: ${stats.updated}, Failed: ${stats.failed}, Skipped: ${stats.skipped}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, page, brand, stats };
  } catch (error) {
    console.error(`❌ Error processing ${brand} page ${page}:`, error);
    return { success: false, page, brand, error };
  }
}

/**
 * Log extraction results from raw data to processed data
 * @param rawData The original data from the API
 * @param processed The processed product data
 */
export function logExtractionDetails(rawData: any, processed: any) {
  console.log(`\n🔬 DATA EXTRACTION ANALYSIS:`);
  
  // Check for title extraction
  if (rawData.title && processed.title) {
    console.log(`✅ Title extraction: "${rawData.title}" → "${processed.title}"`);
  } else {
    console.log(`❌ Title extraction failed`);
  }
  
  // Check for specs extraction
  const specsChecklist = [
    { name: 'Brand', raw: rawData.brand, processed: processed.brand },
    { name: 'Model', raw: rawData.model, processed: processed.model },
    { name: 'Processor', raw: rawData.processor, processed: processed.processor },
    { name: 'RAM', raw: rawData.ram, processed: processed.ram },
    { name: 'Storage', raw: rawData.storage, processed: processed.storage },
    { name: 'Graphics', raw: rawData.graphics, processed: processed.graphics },
    { name: 'Screen Size', raw: rawData.screen_size, processed: processed.screen_size }
  ];
  
  // Count successful extractions
  const successfulExtractions = specsChecklist.filter(item => !!item.processed).length;
  const totalSpecs = specsChecklist.length;
  
  console.log(`📊 Extraction rate: ${successfulExtractions}/${totalSpecs} specs (${Math.round((successfulExtractions/totalSpecs)*100)}%)`);
  
  // Log each spec extraction attempt
  specsChecklist.forEach(spec => {
    const success = !!spec.processed;
    const emoji = success ? '✅' : '❌';
    const rawValue = spec.raw || 'null';
    const processedValue = spec.processed || 'null';
    
    if (success) {
      console.log(`${emoji} ${spec.name}: "${rawValue}" → "${processedValue}"`);
    } else {
      if (spec.raw) {
        console.log(`${emoji} ${spec.name}: Failed to extract from "${rawValue}"`);
      } else {
        console.log(`${emoji} ${spec.name}: No data available in source`);
      }
    }
  });
  
  // Log source for successful extractions
  console.log(`\n📋 EXTRACTION SOURCES:`);
  specsChecklist.forEach(spec => {
    if (spec.processed) {
      const source = spec.raw ? 'Direct data' : 'Title extraction';
      console.log(`🔄 ${spec.name}: ${source}`);
    }
  });
  
  console.log(`\n`);
}

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

/**
 * Log data extraction performance metrics
 * @param products Array of products processed
 */
export function logExtractionPerformance(products: any[]) {
  if (!products || products.length === 0) {
    console.log(`⚠️ No products to analyze extraction performance`);
    return;
  }

  const totalProducts = products.length;
  const missingFields = {
    brand: 0,
    model: 0,
    processor: 0,
    ram: 0,
    storage: 0,
    graphics: 0,
    screen_size: 0,
    price: 0
  };
  
  // Count missing fields
  products.forEach(product => {
    if (!product.brand || product.brand === '') missingFields.brand++;
    if (!product.model || product.model === '') missingFields.model++;
    if (!product.processor || product.processor === '') missingFields.processor++;
    if (!product.ram || product.ram === '') missingFields.ram++;
    if (!product.storage || product.storage === '') missingFields.storage++;
    if (!product.graphics || product.graphics === '') missingFields.graphics++;
    if (!product.screen_size || product.screen_size === '') missingFields.screen_size++;
    if (!product.current_price) missingFields.price++;
  });
  
  // Calculate percentages
  const percentages = {
    brand: Math.round((missingFields.brand / totalProducts) * 100),
    model: Math.round((missingFields.model / totalProducts) * 100),
    processor: Math.round((missingFields.processor / totalProducts) * 100),
    ram: Math.round((missingFields.ram / totalProducts) * 100),
    storage: Math.round((missingFields.storage / totalProducts) * 100),
    graphics: Math.round((missingFields.graphics / totalProducts) * 100),
    screen_size: Math.round((missingFields.screen_size / totalProducts) * 100),
    price: Math.round((missingFields.price / totalProducts) * 100)
  };
  
  console.log(`\n📊 EXTRACTION PERFORMANCE METRICS (${totalProducts} products):`);
  console.log(`  🏷️ Missing Brand: ${missingFields.brand}/${totalProducts} (${percentages.brand}%)`);
  console.log(`  📱 Missing Model: ${missingFields.model}/${totalProducts} (${percentages.model}%)`);
  console.log(`  🧠 Missing Processor: ${missingFields.processor}/${totalProducts} (${percentages.processor}%)`);
  console.log(`  🧮 Missing RAM: ${missingFields.ram}/${totalProducts} (${percentages.ram}%)`);
  console.log(`  💾 Missing Storage: ${missingFields.storage}/${totalProducts} (${percentages.storage}%)`);
  console.log(`  🎮 Missing Graphics: ${missingFields.graphics}/${totalProducts} (${percentages.graphics}%)`);
  console.log(`  📱 Missing Screen Size: ${missingFields.screen_size}/${totalProducts} (${percentages.screen_size}%)`);
  console.log(`  💰 Missing Price: ${missingFields.price}/${totalProducts} (${percentages.price}%)`);
  
  // Average completion rate
  const fields = Object.keys(missingFields).length;
  const totalMissingPercentage = Object.values(percentages).reduce((sum, val) => sum + val, 0);
  const averageMissingRate = Math.round(totalMissingPercentage / fields);
  const averageCompletionRate = 100 - averageMissingRate;
  
  console.log(`\n📈 OVERALL DATA QUALITY:`);
  console.log(`  ${averageCompletionRate >= 70 ? '🟢' : averageCompletionRate >= 50 ? '🟡' : '🔴'} Average completion rate: ${averageCompletionRate}%`);
  
  // Analysis of extraction issues
  console.log(`\n🔍 EXTRACTION ISSUE ANALYSIS:`);
  
  // Find the most problematic fields
  const sortedFields = Object.entries(percentages)
    .sort(([, a], [, b]) => b - a)
    .map(([field, percentage]) => ({ field, percentage }));
  
  console.log(`  Most problematic fields:`);
  sortedFields.slice(0, 3).forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.field}: ${item.percentage}% missing`);
  });
  
  console.log(`\n🛠️ RECOMMENDED IMPROVEMENTS:`);
  
  if (percentages.processor > 50) {
    console.log(`  ⚙️ Enhance processor extraction patterns to recognize more CPU variants`);
  }
  if (percentages.ram > 50) {
    console.log(`  ⚙️ Improve RAM extraction to better handle various formats (e.g., "16 GB", "16GB", "16G")`);
  }
  if (percentages.storage > 50) {
    console.log(`  ⚙️ Refine storage extraction to recognize complex patterns (e.g., "512GB SSD + 1TB HDD")`);
  }
  if (percentages.graphics > 50) {
    console.log(`  ⚙️ Enhance graphics card recognition for integrated and discrete GPUs`);
  }
  
  console.log('\n');
}
