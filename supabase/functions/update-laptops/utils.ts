
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Track the update progress globally
let isProcessing = false;
let processedCount = 0;
let totalLaptops = 0;
let lastProcessedTimestamp = Date.now();
export const PROCESSING_TIMEOUT = 300000; // 5 minute timeout

// Function to update processing status
export function updateProcessingStatus() {
  const now = Date.now();
  if (now - lastProcessedTimestamp > PROCESSING_TIMEOUT) {
    isProcessing = false;
    console.log('Processing timed out - resetting status');
  }
  lastProcessedTimestamp = now;
  return isProcessing;
}

export function resetProcessingState() {
  isProcessing = false;
  processedCount = 0;
  totalLaptops = 0;
  lastProcessedTimestamp = Date.now();
}

export function initializeProcessing(laptopCount: number) {
  isProcessing = true;
  processedCount = 0;
  totalLaptops = laptopCount;
  lastProcessedTimestamp = Date.now();
}

export function incrementProcessedCount() {
  processedCount++;
  return processedCount;
}

export function getProcessingStatus() {
  return {
    isProcessing,
    processedCount,
    totalLaptops
  };
}

