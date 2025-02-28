
import { useState, useCallback, useEffect } from 'react';
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { resetStalePendingUpdates } from "@/utils/laptop/stats/updateStatusQueries";
import { getDatabaseStats } from "@/utils/laptop/getDatabaseStats";
import { useToast } from "@/components/ui/use-toast";

export const useStatsFetcher = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const { toast } = useToast();

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
    } finally {
      setRefreshing(false);
    }
  }, [stats, toast, refreshing, refreshCount, errorCount, autoRefreshEnabled, checkAndResetStuckUpdates]);

  // Perform an initial fetch on component mount
  useEffect(() => {
    console.log('useStatsFetcher: Initial mount effect running');
    if (loading && !stats && !refreshing) {
      console.log('useStatsFetcher: Performing initial automatic fetch');
      fetchStats().catch(err => {
        console.error('Initial fetch error in useStatsFetcher:', err);
        setLoading(false); // Ensure we exit loading state even on error
      });
    }
  }, [loading, stats, refreshing, fetchStats]);

  return {
    stats,
    setStats,
    loading,
    setLoading,
    error,
    setError,
    refreshing,
    setRefreshing,
    lastRefreshTime,
    setLastRefreshTime,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    refreshCount,
    setRefreshCount,
    errorCount,
    setErrorCount,
    fetchStats,
  };
};
