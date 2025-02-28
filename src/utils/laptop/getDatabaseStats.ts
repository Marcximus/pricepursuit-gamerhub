
import { 
  getTotalLaptopCount, 
  getLaptopsWithPriceCount, 
  getLaptopsWithProcessorCount,
  getLaptopsWithRamCount,
  getLaptopsWithStorageCount,
  getLaptopsWithGraphicsCount,
  getLaptopsWithScreenSizeCount
} from "./stats/basicCountQueries";
import { 
  getNotUpdatedLaptopsCount, 
  getNotCheckedLaptopsCount 
} from "./stats/updateStatusQueries";
import { 
  getPendingAIProcessingCount, 
  getProcessingAICount, 
  getErrorAIProcessingCount, 
  getCompleteAIProcessingCount 
} from "./stats/aiProcessingQueries";
import { 
  calculatePercentage, 
  calculateInversePercentage 
} from "./stats/percentageCalculator";
import { DatabaseStats } from "./stats/types";

export async function getDatabaseStats(): Promise<DatabaseStats> {
  try {
    console.log('Fetching database statistics...');
    
    // Get total count of laptop products
    const { count: totalCount, error: countError } = await getTotalLaptopCount();
    if (countError) throw countError;

    // Get count of products with valid prices
    const { count: priceCount, error: priceError } = await getLaptopsWithPriceCount();
    if (priceError) throw priceError;

    // Get count of products with valid processor data
    const { count: processorCount, error: processorError } = await getLaptopsWithProcessorCount();
    if (processorError) throw processorError;

    // Get count of products with valid RAM data
    const { count: ramCount, error: ramError } = await getLaptopsWithRamCount();
    if (ramError) throw ramError;

    // Get count of products with valid storage data
    const { count: storageCount, error: storageError } = await getLaptopsWithStorageCount();
    if (storageError) throw storageError;

    // Get count of products with valid graphics data
    const { count: graphicsCount, error: graphicsError } = await getLaptopsWithGraphicsCount();
    if (graphicsError) throw graphicsError;

    // Get count of products with valid screen size data
    const { count: screenSizeCount, error: screenSizeError } = await getLaptopsWithScreenSizeCount();
    if (screenSizeError) throw screenSizeError;

    // Get update and check status counts (last 24 hours)
    const { count: notUpdatedCount, error: notUpdatedError } = await getNotUpdatedLaptopsCount();
    if (notUpdatedError) throw notUpdatedError;

    const { count: notCheckedCount, error: notCheckedError } = await getNotCheckedLaptopsCount();
    if (notCheckedError) throw notCheckedError;

    // Get AI processing status counts
    const { count: pendingCount, error: pendingError } = await getPendingAIProcessingCount();
    if (pendingError) throw pendingError;

    const { count: processingCount, error: processingError } = await getProcessingAICount();
    if (processingError) throw processingError;

    const { count: errorCount, error: errorStatusError } = await getErrorAIProcessingCount();
    if (errorStatusError) throw errorStatusError;

    const { count: completeCount, error: completeError } = await getCompleteAIProcessingCount();
    if (completeError) throw completeError;

    // Calculate percentages and processing completion percentage
    const processingCompletionPercentage = calculatePercentage(completeCount, totalCount);

    return {
      totalLaptops: totalCount,
      updateStatus: {
        notUpdated: {
          count: notUpdatedCount,
          percentage: calculatePercentage(notUpdatedCount, totalCount)
        },
        notChecked: {
          count: notCheckedCount,
          percentage: calculatePercentage(notCheckedCount, totalCount)
        }
      },
      aiProcessingStatus: {
        pending: {
          count: pendingCount,
          percentage: calculatePercentage(pendingCount, totalCount)
        },
        processing: {
          count: processingCount,
          percentage: calculatePercentage(processingCount, totalCount)
        },
        error: {
          count: errorCount,
          percentage: calculatePercentage(errorCount, totalCount)
        },
        complete: {
          count: completeCount,
          percentage: calculatePercentage(completeCount, totalCount)
        },
        completionPercentage: processingCompletionPercentage
      },
      missingInformation: {
        prices: {
          count: totalCount - priceCount,
          percentage: calculateInversePercentage(priceCount, totalCount)
        },
        processor: {
          count: totalCount - processorCount,
          percentage: calculateInversePercentage(processorCount, totalCount)
        },
        ram: {
          count: totalCount - ramCount,
          percentage: calculateInversePercentage(ramCount, totalCount)
        },
        storage: {
          count: totalCount - storageCount,
          percentage: calculateInversePercentage(storageCount, totalCount)
        },
        graphics: {
          count: totalCount - graphicsCount,
          percentage: calculateInversePercentage(graphicsCount, totalCount)
        },
        screenSize: {
          count: totalCount - screenSizeCount,
          percentage: calculateInversePercentage(screenSizeCount, totalCount)
        }
      }
    };
  } catch (error) {
    console.error('Error in getDatabaseStats:', error);
    throw error;
  }
}
