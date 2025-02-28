
import React, { useState } from "react";
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
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateLaptops = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
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
          title: "Update Status",
          description: result?.error || result?.message || "Failed to start laptop updates. Please check console for details.",
          variant: result?.success === false ? "destructive" : "default"
        });
        console.error('Update finished with result:', result);
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
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ManagementCard
      title="Update Laptops"
      description="Update prices and information for all laptops - prioritizes by oldest check date, missing prices and images"
      icon={RefreshCw}
      buttonText={isUpdating ? "Updating..." : "Update Prices"}
      onClick={handleUpdateLaptops}
      variant="outline"
      disabled={isUpdating}
    />
  );
};

export default UpdateLaptopsSection;
