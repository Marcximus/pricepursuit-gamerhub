
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
    const totalCount = await getTotalLaptopCount();

    // Get count of products with valid prices
    const priceCount = await getLaptopsWithPriceCount();

    // Get count of products with valid processor data
    const processorCount = await getLaptopsWithProcessorCount();

    // Get count of products with valid RAM data
    const ramCount = await getLaptopsWithRamCount();

    // Get count of products with valid storage data
    const storageCount = await getLaptopsWithStorageCount();

    // Get count of products with valid graphics data
    const graphicsCount = await getLaptopsWithGraphicsCount();

    // Get count of products with valid screen size data
    const screenSizeCount = await getLaptopsWithScreenSizeCount();

    // Get update and check status counts (last 24 hours)
    const notUpdatedCount = await getNotUpdatedLaptopsCount();
    const notCheckedCount = await getNotCheckedLaptopsCount();

    // Get AI processing status counts
    const pendingCount = await getPendingAIProcessingCount();
    const processingCount = await getProcessingAICount();
    const errorCount = await getErrorAIProcessingCount();
    const completeCount = await getCompleteAIProcessingCount();

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
