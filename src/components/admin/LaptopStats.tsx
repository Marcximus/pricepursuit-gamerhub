
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseOverview } from './stats/DatabaseOverview';
import { AiProcessingStatus } from './stats/AiProcessingStatus';
import { MissingInformation } from './stats/MissingInformation';
import { UpdateStatusOverview } from './stats/UpdateStatusOverview';
import DuplicateAsinChecker from './stats/DuplicateAsinChecker';
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { getDatabaseStats } from "@/utils/laptop/getDatabaseStats";
import { LoadingState } from './stats/LoadingState';
import { ErrorState } from './stats/ErrorState';
import { useToast } from "@/components/ui/use-toast";

// Create a context for refreshing stats that can be used anywhere in the app
export const StatsRefreshContext = React.createContext<() => Promise<void>>(() => Promise.resolve());

const LaptopStats = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const { toast } = useToast();

  // Create a stable fetchStats function that can be passed to the context
  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      console.log('Fetching database statistics...');
      const databaseStats = await getDatabaseStats();
      
      // Log detailed stats to help debug missing information
      console.log('Database stats received:', {
        totalLaptops: databaseStats.totalLaptops,
        pendingUpdates: databaseStats.updateStatus.pendingUpdate.count,
        inProgressUpdates: databaseStats.updateStatus.inProgress.count,
        completedUpdates: databaseStats.updateStatus.completed.count,
        errorUpdates: databaseStats.updateStatus.error.count,
        missingPrices: databaseStats.missingInformation.prices.count,
      });
      
      setStats(databaseStats);
      setLastRefreshTime(new Date());
      setError(null);
      return databaseStats;
    } catch (err) {
      console.error('Error fetching database stats:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Only show toast if this was a manual refresh or if we don't have any stats yet
      if (refreshing || !stats) {
        toast({
          title: "Error",
          description: "Failed to refresh database statistics",
          variant: "destructive",
        });
      }
      throw err;
    } finally {
      setRefreshing(false);
    }
  }, [stats, toast, refreshing]);

  // Initial data fetch
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true);
        await fetchStats();
      } catch (error) {
        console.error("Initial fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initialFetch();
  }, [fetchStats]);

  // Set up auto-refresh interval based on update activity
  useEffect(() => {
    // Setup more frequent refresh when updates are happening
    const hasActiveUpdates = stats?.updateStatus?.inProgress?.count > 0;
    const refreshInterval = hasActiveUpdates ? 5000 : 15000; // 5s when active, 15s when idle
    
    console.log(`Setting up stats refresh interval: ${refreshInterval}ms, active updates: ${hasActiveUpdates}`);
    
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing stats...');
      fetchStats().catch(err => console.error('Auto-refresh error:', err));
    }, refreshInterval);
    
    // Clean up interval on component unmount or when refresh frequency changes
    return () => clearInterval(intervalId);
  }, [fetchStats, stats?.updateStatus?.inProgress?.count]);

  const handleManualRefresh = async () => {
    if (!refreshing) {
      try {
        console.log('Manual refresh triggered');
        await fetchStats();
        toast({
          title: "Stats Updated",
          description: "Database statistics refreshed successfully",
        });
      } catch (error) {
        console.error("Manual refresh error:", error);
      }
    }
  };

  if (loading && !stats) {
    return <LoadingState message="Loading database statistics..." />;
  }

  if (error && !stats) {
    return <ErrorState message="Failed to load database statistics" error={error} />;
  }

  // If we have an error but also have stats (from a previous successful load)
  // we'll show the stats but with a toast notification about the refresh error

  return (
    <StatsRefreshContext.Provider value={fetchStats}>
      <div className="w-full space-y-4 mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Database Statistics</h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              Last refreshed: {lastRefreshTime.toLocaleTimeString()}
            </span>
            <button 
              onClick={handleManualRefresh} 
              disabled={refreshing}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center space-x-1"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Refreshing...</span>
                </>
              ) : (
                <span>Refresh Stats</span>
              )}
            </button>
          </div>
        </div>
        
        {stats ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="update-status">Update Status</TabsTrigger>
              <TabsTrigger value="ai-processing">AI Processing</TabsTrigger>
              <TabsTrigger value="missing-data">Missing Data</TabsTrigger>
              <TabsTrigger value="data-quality">Data Quality</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <DatabaseOverview stats={stats} />
            </TabsContent>
            <TabsContent value="update-status" className="mt-4">
              <UpdateStatusOverview stats={stats} />
            </TabsContent>
            <TabsContent value="ai-processing" className="mt-4">
              <AiProcessingStatus stats={stats} />
            </TabsContent>
            <TabsContent value="missing-data" className="mt-4">
              <MissingInformation stats={stats} />
            </TabsContent>
            <TabsContent value="data-quality" className="mt-4">
              <DuplicateAsinChecker />
            </TabsContent>
          </Tabs>
        ) : (
          <ErrorState message="No database statistics available" />
        )}
      </div>
    </StatsRefreshContext.Provider>
  );
}

export default LaptopStats;
