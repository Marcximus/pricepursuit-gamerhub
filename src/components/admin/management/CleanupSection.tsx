
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cleanupLaptopDatabase } from "@/utils/laptop/cleanupLaptops";
import { refreshBrandModels } from "@/utils/laptop/refreshBrandModels";
import { UpdateSpecificLaptops } from "./processors/UpdateSpecificLaptops";

type CleanupSectionProps = {
  refreshStats: () => void;
};

const CleanupSection: React.FC<CleanupSectionProps> = ({ refreshStats }) => {
  const [isWorking, setIsWorking] = React.useState(false);

  const handleCleanup = async () => {
    try {
      setIsWorking(true);
      toast.info("Starting laptop database cleanup...");
      const result = await cleanupLaptopDatabase();
      console.log("Cleanup result:", result);
      toast.success(`Database cleanup complete. ${result.removedForbiddenKeywords} items removed.`);
      refreshStats();
    } catch (error) {
      console.error("Error during cleanup:", error);
      toast.error("Cleanup failed. See console for details.");
    } finally {
      setIsWorking(false);
    }
  };

  const handleRefreshBrandModels = async () => {
    try {
      setIsWorking(true);
      toast.info("Starting brand/model refresh...");
      const result = await refreshBrandModels();
      console.log("Brand/model refresh result:", result);
      toast.success(`Brand/model refresh complete. ${result.updated} items updated.`);
      refreshStats();
    } catch (error) {
      console.error("Error during brand/model refresh:", error);
      toast.error("Brand/model refresh failed. See console for details.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-md font-medium mb-2">Database Maintenance</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Run occasional cleanup operations to remove outdated or incomplete laptop records.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleCleanup}
              disabled={isWorking}
              variant="outline"
              size="sm"
            >
              {isWorking ? "Processing..." : "Remove Invalid Products"}
            </Button>
            <Button
              onClick={handleRefreshBrandModels}
              disabled={isWorking}
              variant="outline"
              size="sm"
            >
              {isWorking ? "Processing..." : "Refresh Brand & Model Data"}
            </Button>
          </div>
        </div>

        <UpdateSpecificLaptops />
      </div>
    </Card>
  );
};

export default CleanupSection;
