
import React, { useState, useEffect } from 'react';
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
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      console.log('Fetching database statistics...');
      const databaseStats = await getDatabaseStats();
      
      // Log detailed stats to help debug missing information
      console.log('Database stats received:', {
        totalLaptops: databaseStats.totalLaptops,
        missingPrices: databaseStats.missingInformation.prices,
        missingProcessor: databaseStats.missingInformation.processor,
        missingRam: databaseStats.missingInformation.ram,
        missingStorage: databaseStats.missingInformation.storage,
        missingGraphics: databaseStats.missingInformation.graphics,
        missingScreenSize: databaseStats.missingInformation.screenSize,
      });
      
      // Log sample data to inspect what's happening
      console.log('Checking sample laptops in the database for diagnosis...');
      
      setStats(databaseStats);
      setError(null);
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up a refresh interval (every 60 seconds)
    const intervalId = setInterval(fetchStats, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleManualRefresh = () => {
    if (!refreshing) {
      setRefreshing(true);
      fetchStats();
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
          <button 
            onClick={handleManualRefresh} 
            disabled={refreshing}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Stats'}
          </button>
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
