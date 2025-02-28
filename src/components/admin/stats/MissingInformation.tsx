
import React from "react";
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MissingDataOverview } from "./missing-data/MissingDataOverview";
import { MissingDataDiagnostics } from "./missing-data/MissingDataDiagnostics";
import { calculateAverageMissingPercentage, logMissingDataStats } from "./missing-data/MissingDataUtils";

interface MissingInformationProps {
  stats: DatabaseStats;
}

export function MissingInformation({ stats }: MissingInformationProps) {
  const { toast } = useToast();
  
  // Log detailed information about the missing data to help debug
  React.useEffect(() => {
    // Enhanced logging to debug missing data issues
    logMissingDataStats(stats);
  }, [stats]);

  // Calculate the average missing data percentage
  const avgMissingPercentage = calculateAverageMissingPercentage(
    stats.missingInformation.processor.percentage,
    stats.missingInformation.ram.percentage,
    stats.missingInformation.storage.percentage,
    stats.missingInformation.graphics.percentage,
    stats.missingInformation.screenSize.percentage
  );

  const handleRunAIProcessing = () => {
    toast({
      title: "Starting AI Processing",
      description: "Initiating AI processing to analyze and extract missing specifications.",
    });
    // The actual AI processing function would be called here
    // This button just serves as a convenient way to trigger it from this screen
  };

  const handleDiagnosticRun = () => {
    toast({
      title: "Running Diagnostic",
      description: "Starting comprehensive diagnostic on data extraction process.",
    });
    // In a real implementation, this would trigger a diagnostic process
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Missing Information Analysis</span>
          <span className={`text-sm rounded-full px-3 py-1 ${avgMissingPercentage > 50 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
            Avg. Missing: {avgMissingPercentage.toFixed(1)}%
          </span>
        </CardTitle>
        <CardDescription>
          This section shows what percentage of laptops are missing key specification data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
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
            <MissingDataDiagnostics onDiagnosticRun={handleDiagnosticRun} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
