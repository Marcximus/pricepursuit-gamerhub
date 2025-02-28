
import { supabase } from "@/integrations/supabase/client";
import { DatabaseStats } from "./stats/types";
import { getTotalLaptopsCount } from "./stats/basicCountQueries";
import { getNotUpdatedLaptopsCount, getNotCheckedLaptopsCount, getRecentlyCheckedLaptopsCount } from "./stats/updateStatusQueries";
import { getPendingAICount, getProcessedAICount, getInProgressAICount, getErrorAICount } from "./stats/aiProcessingQueries";
import { 
  getNoProcessorCount, 
  getNoRamCount, 
  getNoStorageCount, 
  getNoGraphicsCount,
  getMissingAnySpecCount
} from "./stats/missingInfoQueries";
import { calculatePercentage } from "./stats/percentageCalculator";

export async function getDatabaseStats(): Promise<DatabaseStats> {
  try {
    // Get basic counts
    const totalLaptops = await getTotalLaptopsCount();
    
    // Get update status counts
    const notUpdated = await getNotUpdatedLaptopsCount();
    const notChecked = await getNotCheckedLaptopsCount();
    const recentlyChecked = await getRecentlyCheckedLaptopsCount();
    
    // Get AI processing status counts
    const pendingAi = await getPendingAICount();
    const processedAi = await getProcessedAICount();
    const inProgressAi = await getInProgressAICount();
    const errorAi = await getErrorAICount();
    
    // Get missing information counts
    const noProcessor = await getNoProcessorCount();
    const noRam = await getNoRamCount();
    const noStorage = await getNoStorageCount();
    const noGraphics = await getNoGraphicsCount();
    const missingAnySpec = await getMissingAnySpecCount();
    
    // Calculate percentages
    const pendingAiPercentage = calculatePercentage(pendingAi.count, totalLaptops.count);
    const processedAiPercentage = calculatePercentage(processedAi.count, totalLaptops.count);
    const missingSpecsPercentage = calculatePercentage(missingAnySpec.count, totalLaptops.count);
    const recentlyCheckedPercentage = calculatePercentage(recentlyChecked.count, totalLaptops.count);
    
    return {
      totalLaptops: totalLaptops.count,
      updateStatus: {
        notUpdated,
        notChecked,
        recentlyChecked
      },
      aiStatus: {
        pending: pendingAi,
        processed: processedAi,
        inProgress: inProgressAi,
        error: errorAi
      },
      missingInfo: {
        noProcessor,
        noRam,
        noStorage,
        noGraphics,
        missingAnySpec
      },
      percentages: {
        pendingAi: pendingAiPercentage,
        processedAi: processedAiPercentage,
        missingSpecs: missingSpecsPercentage,
        recentlyChecked: recentlyCheckedPercentage
      }
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
}
