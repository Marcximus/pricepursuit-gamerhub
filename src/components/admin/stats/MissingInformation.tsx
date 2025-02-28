
import React from "react";
import { MissingDataItem } from "./MissingDataItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, Database, WrenchIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MissingInformationProps {
  stats: DatabaseStats;
}

export function MissingInformation({ stats }: MissingInformationProps) {
  const { toast } = useToast();
  
  // Log detailed information about the missing data to help debug
  console.log('Missing Information Analysis:', {
    totalLaptops: stats.totalLaptops,
    missingPrices: {
      count: stats.missingInformation.prices.count,
      percentage: stats.missingInformation.prices.percentage,
    },
    missingProcessor: {
      count: stats.missingInformation.processor.count,
      percentage: stats.missingInformation.processor.percentage,
    },
    missingRam: {
      count: stats.missingInformation.ram.count,
      percentage: stats.missingInformation.ram.percentage,
    },
    missingStorage: {
      count: stats.missingInformation.storage.count,
      percentage: stats.missingInformation.storage.percentage,
    },
    missingGraphics: {
      count: stats.missingInformation.graphics.count,
      percentage: stats.missingInformation.graphics.percentage,
    },
    missingScreenSize: {
      count: stats.missingInformation.screenSize.count,
      percentage: stats.missingInformation.screenSize.percentage,
    }
  });

  // Calculate the average missing data percentage
  const avgMissingPercentage = (
    stats.missingInformation.processor.percentage +
    stats.missingInformation.ram.percentage +
    stats.missingInformation.storage.percentage +
    stats.missingInformation.graphics.percentage +
    stats.missingInformation.screenSize.percentage
  ) / 5;

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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MissingDataItem 
                  label="Missing Prices"
                  percentage={stats.missingInformation.prices.percentage}
                  count={stats.missingInformation.prices.count}
                  total={stats.totalLaptops}
                />
                
                <MissingDataItem 
                  label="Missing Processor"
                  percentage={stats.missingInformation.processor.percentage}
                  count={stats.missingInformation.processor.count}
                  total={stats.totalLaptops}
                />
                
                <MissingDataItem 
                  label="Missing RAM"
                  percentage={stats.missingInformation.ram.percentage}
                  count={stats.missingInformation.ram.count}
                  total={stats.totalLaptops}
                />
                
                <MissingDataItem 
                  label="Missing Storage"
                  percentage={stats.missingInformation.storage.percentage}
                  count={stats.missingInformation.storage.count}
                  total={stats.totalLaptops}
                />
                
                <MissingDataItem 
                  label="Missing Graphics"
                  percentage={stats.missingInformation.graphics.percentage}
                  count={stats.missingInformation.graphics.count}
                  total={stats.totalLaptops}
                />
                
                <MissingDataItem 
                  label="Missing Screen Size"
                  percentage={stats.missingInformation.screenSize.percentage}
                  count={stats.missingInformation.screenSize.count}
                  total={stats.totalLaptops}
                />
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">How to improve data quality</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Run "Process with AI" to improve specification extraction</li>
                  <li>Check that the collection process is properly parsing product titles</li>
                  <li>Verify the normalizer functions are correctly identifying specifications</li>
                  <li>Review the logs for any data processing errors</li>
                  <li>Check database update queries for proper field mapping</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <Button variant="outline" onClick={handleDiagnosticRun}>
                  <WrenchIcon className="mr-2 h-4 w-4" />
                  Run Diagnostic
                </Button>
                <Button onClick={handleRunAIProcessing}>
                  Process with AI
                  <ArrowRightCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="diagnostics">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Data Collection Pipeline</h3>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex items-start space-x-2">
                    <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Issue: Data Extraction</p>
                      <p className="text-sm text-muted-foreground">Specification data appears to be collected but not properly extracted from product titles and descriptions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Issue: Normalizer Functions</p>
                      <p className="text-sm text-muted-foreground">Normalizers may not be handling the variety of formats present in raw data.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Issue: Database Updates</p>
                      <p className="text-sm text-muted-foreground">Extracted values may not be correctly stored in the database.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Technical Debugging Steps</h3>
                <div className="bg-muted p-4 rounded-md">
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>
                      <p className="font-medium">Examine specification extraction functions:</p>
                      <p className="text-sm text-muted-foreground">Check <code>src/utils/laptopUtils/specsProcessor.ts</code> and other normalizers to verify pattern matching.</p>
                    </li>
                    <li>
                      <p className="font-medium">Verify update query field mapping:</p>
                      <p className="text-sm text-muted-foreground">Ensure extracted values are properly mapped to the right database fields.</p>
                    </li>
                    <li>
                      <p className="font-medium">Validate database commits:</p>
                      <p className="text-sm text-muted-foreground">Confirm that extracted values are being saved to the database correctly.</p>
                    </li>
                    <li>
                      <p className="font-medium">Test with sample data:</p>
                      <p className="text-sm text-muted-foreground">Process known good product titles to verify extraction accuracy.</p>
                    </li>
                    <li>
                      <p className="font-medium">Run AI processing:</p>
                      <p className="text-sm text-muted-foreground">Use the AI processing function to improve extraction for existing products.</p>
                    </li>
                  </ol>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleDiagnosticRun}>
                  <WrenchIcon className="mr-2 h-4 w-4" />
                  Run Full Diagnostic
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
