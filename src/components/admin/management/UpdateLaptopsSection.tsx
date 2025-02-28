import React, { useState, useContext } from "react";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import ManagementCard from "./ManagementCard";
import { StatsRefreshContext } from "@/components/admin/LaptopStats";

interface UpdateLaptopsSectionProps {
  updateLaptops: () => Promise<any>;
  refreshStats: () => Promise<void>;
}

const UpdateLaptopsSection: React.FC<UpdateLaptopsSectionProps> = ({ 
  updateLaptops, 
  refreshStats 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const statsRefresh = useContext(StatsRefreshContext);

  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const startAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
    
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing stats while updates are in progress...');
      if (statsRefresh) {
        statsRefresh();
      }
    }, 10000);
    
    setAutoRefreshInterval(intervalId);
    return intervalId;
  };

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
  };

  const handleUpdateLaptops = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      console.log('Update Prices button clicked');
      console.log('Starting laptop update process...');
      
      const result = await updateLaptops();
      console.log('Update result:', result);
      
      if (result && result.success) {
        const countMatch = result.message.match(/Started updating (\d+) laptops/);
        const count = countMatch ? parseInt(countMatch[1]) : 0;
        setUpdateCount(count);
        
        toast({
          title: "Update Started",
          description: result.message || "Started updating laptop information. This may take a few minutes.",
        });

        if (statsRefresh) {
          await statsRefresh();
        }
        
        startAutoRefresh();
        
        setTimeout(() => {
          stopAutoRefresh();
          if (statsRefresh) {
            statsRefresh();
          }
        }, 5 * 60 * 1000);
      } else {
        toast({
          title: "Update Status",
          description: result?.error || result?.message || "Failed to start laptop updates. Please check console for details.",
          variant: result?.success === false ? "destructive" : "default"
        });
        console.error('Update finished with result:', result);
      }
      
      await refreshStats();
    } catch (error: any) {
      console.error('Error updating laptops:', error);
      toast({
        title: "Error",
        description: "Failed to start laptop updates: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
      stopAutoRefresh();
    } finally {
      if (!autoRefreshInterval) {
        setIsUpdating(false);
      }
    }
  };

  const getDescription = () => {
    if (isUpdating && updateCount > 0) {
      return `Currently updating ${updateCount} laptops. Update process prioritizes oldest check date, missing prices and images.`;
    }
    return "Update prices and information for all laptops - prioritizes by oldest check date, missing prices and images";
  };

  return (
    <ManagementCard
      title="Update Laptops"
      description={getDescription()}
      icon={RefreshCw}
      buttonText={isUpdating ? "Updating..." : "Update Prices"}
      onClick={handleUpdateLaptops}
      variant="outline"
      disabled={isUpdating}
    />
  );
};

export default UpdateLaptopsSection;
