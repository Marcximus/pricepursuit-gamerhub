
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseOverview } from './DatabaseOverview';
import { AiProcessingStatus } from './AiProcessingStatus';
import { MissingInformation } from './MissingInformation';
import { UpdateStatusOverview } from './UpdateStatusOverview';
import DuplicateAsinChecker from './DuplicateAsinChecker';
import { useStats } from './StatsContext';
import { ErrorState } from './ErrorState';

export const StatsTabs: React.FC = () => {
  const { stats } = useStats();

  if (!stats) {
    return <ErrorState message="No database statistics available" />;
  }

  return (
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
  );
};
