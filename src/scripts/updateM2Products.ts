
import { updateMultipleProcessors } from "@/utils/laptop/updateProcessor";
import { toast } from "@/components/ui/use-toast";

/**
 * Updates the specified MacBook ASINs to have "Apple M2 Chip" as processor
 */
export const updateM2Products = async () => {
  // The ASINs and their new processor values
  const updates = [
    { asin: "B0CN2DBKS7", processorValue: "Apple M2 Chip" },
    { asin: "B0CB74GC69", processorValue: "Apple M2 Chip" }
  ];
  
  console.log(`Updating processor values for ${updates.length} MacBooks`);
  
  try {
    const result = await updateMultipleProcessors(updates);
    
    // Display toast notifications for results
    if (result.success) {
      toast({
        title: "Update Successful",
        description: `Updated processor information for ${updates.length} MacBooks to "Apple M2 Chip"`,
      });
    } else {
      // Log detailed results for partial failures
      console.log("Detailed update results:", result.results);
      
      // Count successful updates
      const successCount = result.results.filter(r => r.success).length;
      
      toast({
        title: "Partial Update",
        description: `Updated ${successCount} of ${updates.length} MacBooks. See console for details.`,
        variant: "destructive"
      });
    }
    
    return result;
  } catch (error: any) {
    console.error("Failed to update MacBook processors:", error);
    
    toast({
      title: "Update Failed",
      description: `Failed to update MacBook processors: ${error.message}`,
      variant: "destructive"
    });
    
    return {
      success: false,
      results: []
    };
  }
};
