
import React from "react";
import { toast } from "@/components/ui/use-toast";
import { Filter } from "lucide-react";
import ManagementCard from "./ManagementCard";
import { cleanupLaptopDatabase } from "@/utils/laptop/cleanupLaptops";

interface CleanupSectionProps {
  refreshStats: () => Promise<void>;
}

const CleanupSection: React.FC<CleanupSectionProps> = ({
  refreshStats
}) => {
  const handleCleanup = async () => {
    try {
      const result = await cleanupLaptopDatabase();
      if (result.success) {
        toast({
          title: "Cleanup Complete",
          description: `Successfully cleaned up the laptop database. ${result.removedForbiddenKeywords} products with forbidden keywords were removed.`,
        });
        // Refresh stats immediately after cleanup
        await refreshStats();
      }
    } catch (error) {
      console.error('Error cleaning up laptop database:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clean up laptop database",
      });
    }
  };

  return (
    <ManagementCard
      title="Clean Database"
      description="Remove accessories, duplicates and non-laptop products"
      icon={Filter}
      buttonText="Clean Database"
      onClick={handleCleanup}
      variant="outline"
    />
  );
};

export default CleanupSection;
