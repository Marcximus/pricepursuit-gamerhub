
import { updateProductProcessor } from "./updateProcessor";

/**
 * Performs manual updates to specific products
 */
export const performManualUpdates = async () => {
  console.log("Starting manual product updates");
  
  // Update the M2 MacBooks
  const updates = [
    { asin: "B0CN2DBKS7", processor: "Apple M2 Chip" },
    { asin: "B0CB74GC69", processor: "Apple M2 Chip" }
  ];
  
  for (const item of updates) {
    const result = await updateProductProcessor(item.asin, item.processor);
    console.log(`Update for ${item.asin}: ${result.success ? 'Success' : 'Failed'} - ${result.message}`);
  }
  
  console.log("Completed manual product updates");
  return true;
};

// Execute the updates immediately
performManualUpdates().catch(error => {
  console.error("Error during manual updates:", error);
});
