
import React, { useState } from "react";
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { MissingDataOverview } from "./missing-data/MissingDataOverview";
import { MissingDataDiagnostics } from "./missing-data/MissingDataDiagnostics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface MissingInformationProps {
  stats: DatabaseStats;
}

export function MissingInformation({ stats }: MissingInformationProps) {
  const [runDiagnostic, setRunDiagnostic] = useState(false);
  
  const handleDiagnosticRun = () => {
    setRunDiagnostic(true);
  };
  
  const handleRunAIProcessing = () => {
    console.log('Run AI Processing clicked');
    // Implement AI processing logic here
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <MissingDataOverview 
            stats={stats} 
            onDiagnosticRun={handleDiagnosticRun}
            onRunAIProcessing={handleRunAIProcessing}
          />
        </TabsContent>
        
        <TabsContent value="diagnostics">
          <MissingDataDiagnostics 
            runDiagnostic={runDiagnostic}
            onComplete={() => setRunDiagnostic(false)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
