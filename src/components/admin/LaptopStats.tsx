
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseOverview } from './stats/DatabaseOverview';
import { AiProcessingStatus } from './stats/AiProcessingStatus';
import { MissingInformation } from './stats/MissingInformation';
import DuplicateAsinChecker from './stats/DuplicateAsinChecker';

const LaptopStats = () => {
  return (
    <div className="w-full space-y-4 mt-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-processing">AI Processing</TabsTrigger>
          <TabsTrigger value="missing-data">Missing Data</TabsTrigger>
          <TabsTrigger value="data-quality">Data Quality</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <DatabaseOverview />
        </TabsContent>
        <TabsContent value="ai-processing" className="mt-4">
          <AiProcessingStatus />
        </TabsContent>
        <TabsContent value="missing-data" className="mt-4">
          <MissingInformation />
        </TabsContent>
        <TabsContent value="data-quality" className="mt-4">
          <DuplicateAsinChecker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LaptopStats;
