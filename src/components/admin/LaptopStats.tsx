
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
import { resetStalePendingUpdates } from "@/utils/laptop/stats/updateStatusQueries";

// Create a context for refreshing stats that can be used anywhere in the app
export const StatsRefreshContext = React.createContext<() => Promise<void>>(() => Promise.resolve());

const LaptopStats = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const { toast } = useToast();
  const [errorCount, setErrorCount] = useState<number>(0);

  // Check for errors and reset stuck updates if needed
  const checkAndResetStuckUpdates = useCallback(async () => {
    if (!stats) return;
    
    const hasStuckUpdates = stats.updateStatus.inProgress.count > 0 && 
                            stats.updateStatus.completed.count === 0 && 
                            stats.updateStatus.updatedLast24h.count === 0;
                            
    if (hasStuckUpdates) {
      console.log('Detected stuck updates. Auto-resetting...');
      try {
        await resetStalePendingUpdates();
        console.log('Successfully reset stuck updates');
      } catch (err) {
        console.error('Error auto-resetting stuck updates:', err);
      }
    }
  }, [stats]);

  // Create a stable fetchStats function that can be passed to the context
  const fetchStats = useCallback(async () => {
    // Prevent multiple concurrent refresh calls
    if (refreshing) {
      console.log('Already refreshing, skipping duplicate call');
      return;
    }
    
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
      setRefreshCount(prev => prev + 1);
      setErrorCount(0); // Reset error count on successful fetch
      
      // Check for stuck updates
      if (refreshCount % 5 === 0) { // Only check every 5 refreshes to avoid too many resets
        await checkAndResetStuckUpdates();
      }
    } catch (err) {
      console.error('Error fetching database stats:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setErrorCount(prev => prev + 1);
      
      // Only show toast if this was a manual refresh or if we don't have any stats yet
      if (refreshing || !stats) {
        toast({
          title: "Error",
          description: "Failed to refresh database statistics",
          variant: "destructive",
        });
      }
      
      // If we encounter too many errors, disable auto-refresh
      if (errorCount > 5 && autoRefreshEnabled) {
        setAutoRefreshEnabled(false);
        toast({
          title: "Auto-refresh disabled",
          description: "Too many errors encountered, auto-refresh has been disabled",
          variant: "destructive",
        });
      }
      
      // Re-throw the error so calling functions can handle it
      throw err;
    } finally {
      setRefreshing(false);
    }
  }, [stats, toast, refreshing, refreshCount, errorCount, autoRefreshEnabled, checkAndResetStuckUpdates]);

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
    // This effect should only run once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up auto-refresh interval based on update activity with proper cleanup
  useEffect(() => {
    // Skip if auto-refresh is disabled
    if (!autoRefreshEnabled) {
      console.log('Auto-refresh is disabled');
      return;
    }
    
    // Only run if we have stats
    if (!stats) return;
    
    // Determine if we have active updates
    const hasActiveUpdates = stats.updateStatus?.inProgress?.count > 0;
    
    // Set refresh interval: 5s when updates happening, 30s when idle
    const refreshInterval = hasActiveUpdates ? 5000 : 30000;
    
    console.log(`Setting up stats refresh interval: ${refreshInterval}ms, active updates: ${hasActiveUpdates}, refresh count: ${refreshCount}`);
    
    // Create interval for auto-refresh
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing stats...');
      fetchStats().catch(err => {
        console.error('Auto-refresh error:', err);
      });
    }, refreshInterval);
    
    // Clean up interval when component unmounts or dependencies change
    return () => {
      console.log('Cleaning up refresh interval');
      clearInterval(intervalId);
    };
  }, [stats, fetchStats, autoRefreshEnabled, refreshCount]);

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

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    toast({
      title: autoRefreshEnabled ? "Auto-refresh disabled" : "Auto-refresh enabled",
      description: autoRefreshEnabled 
        ? "You'll need to manually refresh statistics" 
        : "Statistics will refresh automatically",
    });
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
            <div className="flex space-x-2">
              <button 
                onClick={toggleAutoRefresh} 
                className={`px-3 py-1.5 text-xs rounded-md ${
                  autoRefreshEnabled 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
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
