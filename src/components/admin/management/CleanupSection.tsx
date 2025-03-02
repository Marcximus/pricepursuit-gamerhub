
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cleanupLaptopDatabase } from "@/utils/laptop/cleanupLaptops";
import { refreshBrandModels } from "@/utils/laptop/refreshBrandModels";
import { UpdateSpecificLaptops } from "./processors/UpdateSpecificLaptops";
import { AlertTriangle, Trash2 } from "lucide-react";

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
      
      if (result.success) {
        toast.success(`Database cleanup complete. ${result.removedForbiddenKeywords || 0} items with forbidden keywords removed.`);
      } else {
        toast.error("Cleanup encountered issues. Check console for details.");
      }
      
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
          
          <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md flex gap-2 items-start mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                If you're seeing products with accessories or non-laptop items in the results, 
                run the "Remove Invalid Products" function below to clean up the database.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleCleanup}
              disabled={isWorking}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              {isWorking ? (
                "Processing..."
              ) : (
                <>
                  <Trash2 className="h-4 w-4" /> Remove Invalid Products
                </>
              )}
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
