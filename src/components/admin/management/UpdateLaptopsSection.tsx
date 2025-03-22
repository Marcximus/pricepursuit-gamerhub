
import React, { useState, useEffect } from "react";
import { RefreshCw, Clock, AlertOctagon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
  
  // State to track if update has been running for too long
  const [showResetButton, setShowResetButton] = useState(false);
  
  // Initialize update process manager
  const {
    isUpdating,
    updateSuccess,
    elapsedTime,
    autoUpdateEnabled,
    timeUntilNextUpdate,
    toggleAutoUpdate,
    handleUpdateLaptops,
    getDescription,
    forceResetUpdateState
  } = useUpdateProcessManager({
    updateLaptops,
    refreshStats: refreshFunction
  });

  // Effect to show reset button after 5 minutes of updating
  useEffect(() => {
    if (isUpdating && elapsedTime > 5 * 60) {
      setShowResetButton(true);
    } else {
      setShowResetButton(false);
    }
  }, [isUpdating, elapsedTime]);

  const handleToggleAutoUpdate = () => {
    console.log('UpdateLaptopsSection: Auto-update toggle clicked, current state:', autoUpdateEnabled);
    toggleAutoUpdate();
  };

  return (
    <ManagementCard
      title="Update Laptops"
      description={getDescription(isUpdating, elapsedTime, autoUpdateEnabled, timeUntilNextUpdate)}
      icon={RefreshCw}
      buttonText={isUpdating ? "Updating..." : "Update Prices"}
      onClick={handleUpdateLaptops}
      variant={updateSuccess ? "success" : "outline"}
      disabled={isUpdating}
      customActions={
        <div className="flex items-center gap-2">
          {showResetButton && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={forceResetUpdateState}
              className="mr-2 flex items-center gap-1"
            >
              <AlertOctagon className="h-3.5 w-3.5" />
              Reset Update
            </Button>
          )}
          
          <Switch
            checked={autoUpdateEnabled}
            onCheckedChange={handleToggleAutoUpdate}
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
