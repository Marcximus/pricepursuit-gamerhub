
import React, { useContext, useState, useEffect } from "react";
import { StatsRefreshContext } from "@/components/admin/stats/StatsContext";
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { UpdateStatusCard } from "./update-status/UpdateStatusCard";
import { UpdateTimelineCard } from "./update-status/UpdateTimelineCard";
import { UpdateProgressBar } from "./update-status/UpdateProgressBar";
import { UpdateStatusActions } from "./update-status/UpdateStatusActions";
import { StatusIndicator } from "./update-status/StatusIndicator";

interface UpdateStatusOverviewProps {
  stats: DatabaseStats;
}

export function UpdateStatusOverview({ stats }: UpdateStatusOverviewProps) {
  // Get the refresh function from context to allow manual refresh
  const refreshStats = useContext(StatsRefreshContext);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString());

  // Update last updated time when stats change
  useEffect(() => {
    setLastUpdatedTime(new Date().toLocaleTimeString());
  }, [stats]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Update Status</h3>
        <UpdateStatusActions stats={stats} refreshStats={refreshStats} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UpdateStatusCard stats={stats} />
        <UpdateTimelineCard stats={stats} />
      </div>
      
      <UpdateProgressBar stats={stats} />
      <StatusIndicator stats={stats} lastUpdatedTime={lastUpdatedTime} />
    </div>
  );
}
