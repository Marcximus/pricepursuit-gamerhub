
import { processOxylabsResponse } from "../oxylabs";
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

// Helper function to merge new data with existing data, preserving existing values
export const preserveExistingData = (newData: any, existingData: any) => {
  if (!existingData) return newData;
  
  // Create a merged object that prioritizes existing data
  const mergedData = { ...newData };
  
  // List of fields we want to preserve if they already exist
  const fieldsToPreserve = [
    'processor', 'ram', 'storage', 'graphics', 'screen_size', 
    'screen_resolution', 'weight', 'brand', 'model', 
    'processor_score', 'battery_life', 'operating_system'
  ];
  
  // Preserve existing values for specific fields if they exist
  for (const field of fieldsToPreserve) {
    if (existingData[field] && existingData[field].trim && existingData[field].trim() !== '') {
      mergedData[field] = existingData[field];
      console.log(`Preserved existing ${field}: ${existingData[field]}`);
    }
  }
  
  // Always update price, image, and rating information as these should be refreshed
  ['current_price', 'original_price', 'image_url', 'rating', 'rating_count'].forEach(field => {
    if (newData[field] !== null && newData[field] !== undefined) {
      mergedData[field] = newData[field];
    }
  });
  
  return mergedData;
};
