
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
    const totalCountResult = await getTotalLaptopCount();
    const totalCount = totalCountResult.count;

    // Get count of products with valid prices
    const priceCountResult = await getLaptopsWithPriceCount();
    const priceCount = priceCountResult.count;

    // Get count of products with valid processor data
    const processorCountResult = await getLaptopsWithProcessorCount();
    const processorCount = processorCountResult.count;

    // Get count of products with valid RAM data
    const ramCountResult = await getLaptopsWithRamCount();
    const ramCount = ramCountResult.count;

    // Get count of products with valid storage data
    const storageCountResult = await getLaptopsWithStorageCount();
    const storageCount = storageCountResult.count;

    // Get count of products with valid graphics data
    const graphicsCountResult = await getLaptopsWithGraphicsCount();
    const graphicsCount = graphicsCountResult.count;

    // Get count of products with valid screen size data
    const screenSizeCountResult = await getLaptopsWithScreenSizeCount();
    const screenSizeCount = screenSizeCountResult.count;

    // Get update and check status counts (last 24 hours)
    const notUpdatedCountResult = await getNotUpdatedLaptopsCount();
    const notUpdatedCount = notUpdatedCountResult.count;
    
    const notCheckedCountResult = await getNotCheckedLaptopsCount();
    const notCheckedCount = notCheckedCountResult.count;

    // Get AI processing status counts
    const pendingCountResult = await getPendingAIProcessingCount();
    const pendingCount = pendingCountResult.count;
    
    const processingCountResult = await getProcessingAICount();
    const processingCount = processingCountResult.count;
    
    const errorCountResult = await getErrorAIProcessingCount();
    const errorCount = errorCountResult.count;
    
    const completeCountResult = await getCompleteAIProcessingCount();
    const completeCount = completeCountResult.count;

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
