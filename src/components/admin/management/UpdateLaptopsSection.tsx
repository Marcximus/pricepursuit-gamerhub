
import React from "react";
import { RefreshCw, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useStats } from "@/components/admin/stats/StatsContext";
import ManagementCard from "./ManagementCard";
import { useUpdateProcessManager } from "./laptops/UpdateProcessManager";

interface UpdateLaptopsSectionProps {
  updateLaptops: () => Promise<any>;
  refreshStats: () => Promise<void>;
}

const UpdateLaptopsSection: React.FC<UpdateLaptopsSectionProps> = ({ 
  updateLaptops, 
  refreshStats 
}) => {
  // Get stats context refresh function if available
  const stats = useStats();
  const statsRefresh = stats?.fetchStats;
  
  // Use the refreshStats prop if context is not available, otherwise use context
  const refreshFunction = statsRefresh || refreshStats;
  
  // Initialize update process manager
  const {
    isUpdating,
    updateSuccess,
    elapsedTime,
    autoUpdateEnabled,
    timeUntilNextUpdate,
    toggleAutoUpdate,
    handleUpdateLaptops,
    getDescription
  } = useUpdateProcessManager({
    updateLaptops,
    refreshStats: refreshFunction
  });

  return (
    <ManagementCard
      title="Update Laptops"
      description={getDescription(elapsedTime, timeUntilNextUpdate)}
      icon={RefreshCw}
      buttonText={isUpdating ? "Updating..." : "Update Prices"}
      onClick={handleUpdateLaptops}
      variant={updateSuccess ? "success" : "outline"}
      disabled={isUpdating}
      customActions={
        <div className="flex items-center gap-2">
          <Switch
            checked={autoUpdateEnabled}
            onCheckedChange={toggleAutoUpdate}
            disabled={isUpdating}
            id="auto-update-switch"
          />
          <label 
            htmlFor="auto-update-switch" 
            className="text-sm cursor-pointer flex items-center gap-1"
          >
            <Clock className="h-3.5 w-3.5" />
            Auto-update
          </label>
        </div>
      }
    />
  );
};

export default UpdateLaptopsSection;
