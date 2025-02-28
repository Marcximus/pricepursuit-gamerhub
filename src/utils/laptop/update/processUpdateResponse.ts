
import { processOxylabsResponse } from "../oxylabsDataProcessor";
import { logLaptopProcessingDetails } from "../collection/status/processingLogs";

// Create a helper function to process an update response directly
export const processUpdateResponse = (response: any, existingData: any) => {
  if (!response || !response.results || !response.results.length) {
    console.error('Invalid update response format');
    return null;
  }
  
  try {
    // Process through our enhanced Oxylabs processor
    const processedData = processOxylabsResponse(response);
    
    if (!processedData) {
      console.error('Failed to process data');
      return null;
    }
    
    // Log detailed processing information for debugging
    logLaptopProcessingDetails(
      processedData.asin,
      processedData.title,
      processedData,
      existingData
    );
    
    return processedData;
  } catch (error) {
    console.error('Error in processUpdateResponse:', error);
    return null;
  }
};
