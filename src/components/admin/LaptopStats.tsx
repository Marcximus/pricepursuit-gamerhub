
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseOverview } from './stats/DatabaseOverview';
import { AiProcessingStatus } from './stats/AiProcessingStatus';
import { MissingInformation } from './stats/MissingInformation';
import DuplicateAsinChecker from './stats/DuplicateAsinChecker';
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { getDatabaseStats } from "@/utils/laptop/getDatabaseStats";
import { LoadingState } from './stats/LoadingState';
import { ErrorState } from './stats/ErrorState';

const LaptopStats = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const databaseStats = await getDatabaseStats();
        setStats(databaseStats);
        setError(null);
      } catch (err) {
        console.error('Error fetching database stats:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up a refresh interval (every 60 seconds)
    const intervalId = setInterval(fetchStats, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading && !stats) {
    return <LoadingState message="Loading database statistics..." />;
  }

  if (error && !stats) {
    return <ErrorState message="Failed to load database statistics" error={error} />;
  }

  // If we have an error but also have stats (from a previous successful load)
  // we'll show the stats but with a toast notification about the refresh error

  return (
    <div className="w-full space-y-4 mt-4">
      {stats ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-processing">AI Processing</TabsTrigger>
            <TabsTrigger value="missing-data">Missing Data</TabsTrigger>
            <TabsTrigger value="data-quality">Data Quality</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <DatabaseOverview stats={stats} />
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
  );
};

export default LaptopStats;
