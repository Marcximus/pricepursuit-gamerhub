
import React from "react";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import ManagementCard from "./ManagementCard";

interface UpdateLaptopsSectionProps {
  updateLaptops: () => Promise<any>;
  refreshStats: () => Promise<void>;
}

const UpdateLaptopsSection: React.FC<UpdateLaptopsSectionProps> = ({ 
  updateLaptops, 
  refreshStats 
}) => {
  const handleUpdateLaptops = async () => {
    try {
      console.log('Update Prices button clicked');
      console.log('Starting laptop update process...');
      
      const result = await updateLaptops();
      console.log('Update result:', result);
      
      if (result && result.success) {
        toast({
          title: "Update Started",
          description: result.message || "Started updating laptop information. This may take a few minutes.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: result?.error || "Failed to start laptop updates. Please check console for details.",
          variant: "destructive"
        });
        console.error('Update failed with result:', result);
      }
      
      // Refresh stats immediately after update request
      await refreshStats();
    } catch (error) {
      console.error('Error updating laptops:', error);
      toast({
        title: "Error",
        description: "Failed to start laptop updates: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    }
  };

  return (
    <ManagementCard
      title="Update Laptops"
      description="Update prices and information for existing laptops"
      icon={RefreshCw}
      buttonText="Update Prices"
      onClick={handleUpdateLaptops}
      variant="outline"
    />
  );
};

export default UpdateLaptopsSection;
