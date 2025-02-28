
import React from "react";
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MissingDataOverview } from "./missing-data/MissingDataOverview";
import { MissingDataDiagnostics } from "./missing-data/MissingDataDiagnostics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { calculateAverageMissingPercentage, logMissingDataStats } from "./missing-data/MissingDataUtils";
import { supabase } from "@/integrations/supabase/client";

interface MissingInformationProps {
  stats: DatabaseStats;
}

export function MissingInformation({ stats }: MissingInformationProps) {
  const { toast } = useToast();
  const [sampleLaptops, setSampleLaptops] = React.useState<any[]>([]);
  const [isLoadingSamples, setIsLoadingSamples] = React.useState(false);
  const [debugMode, setDebugMode] = React.useState(false);
  
  // Log detailed information about the missing data to help debug
  React.useEffect(() => {
    // Enhanced logging to debug missing data issues
    logMissingDataStats(stats);
    
    // Load sample laptops with missing data for inspection
    const loadSampleData = async () => {
      try {
        setIsLoadingSamples(true);
        // Get 5 sample laptops with missing processor data
        const { data, error } = await supabase
          .from('products')
          .select('id, title, asin, brand, model, processor, ram, storage, graphics, screen_size, last_checked, update_status')
          .eq('is_laptop', true)
          .or('processor.is.null,processor.eq.')
          .limit(5);
          
        if (error) {
          console.error('Error fetching sample laptops:', error);
        } else {
          console.log('Sample laptops with missing data:', data);
          setSampleLaptops(data || []);
        }
      } catch (err) {
        console.error('Error in loadSampleData:', err);
      } finally {
        setIsLoadingSamples(false);
      }
    };
    
    loadSampleData();
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

  const handleDiagnosticRun = async () => {
    toast({
      title: "Running Diagnostic",
      description: "Starting comprehensive diagnostic on data extraction process.",
    });
    
    // Check if a recent update was performed but data wasn't saved
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, update_status, last_checked')
        .eq('is_laptop', true)
        .eq('update_status', 'completed')
        .order('last_checked', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error fetching recently updated laptops:', error);
      } else {
        console.log('Recently updated laptops:', data);
        
        // Toggle debug mode to show detailed information
        setDebugMode(true);
        toast({
          title: "Diagnostic Complete",
          description: `Found ${data?.length || 0} recently updated laptops. Check console for details.`,
        });
      }
    } catch (err) {
      console.error('Error in diagnostic:', err);
    }
  };

  const handleRawSqlCheck = async () => {
    // This would normally be done in a backend function but for diagnostic purposes
    // we'll use the Supabase client directly
    try {
      toast({
        title: "Checking Database",
        description: "Running direct query to check specification fields...",
      });
      
      // Get counts of non-null values for key specification columns
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          ram, 
          storage, 
          processor, 
          graphics, 
          screen_size
        `)
        .eq('is_laptop', true)
        .limit(100);
      
      if (error) {
        console.error('Error running SQL query:', error);
        toast({
          title: "Query Error",
          description: "Failed to run database query. See console for details.",
          variant: "destructive"
        });
      } else {
        // Analyze the results
        const totalSample = data.length;
        const stats = {
          processor: data.filter(row => row.processor !== null).length,
          ram: data.filter(row => row.ram !== null).length,
          storage: data.filter(row => row.storage !== null).length,
          graphics: data.filter(row => row.graphics !== null).length,
          screenSize: data.filter(row => row.screen_size !== null).length
        };
        
        console.log('Raw database specification statistics:', {
          totalSample,
          nonNullCounts: stats,
          percentages: {
            processor: ((stats.processor / totalSample) * 100).toFixed(1) + '%',
            ram: ((stats.ram / totalSample) * 100).toFixed(1) + '%',
            storage: ((stats.storage / totalSample) * 100).toFixed(1) + '%',
            graphics: ((stats.graphics / totalSample) * 100).toFixed(1) + '%',
            screenSize: ((stats.screenSize / totalSample) * 100).toFixed(1) + '%'
          }
        });
        
        toast({
          title: "Database Check Complete",
          description: "Retrieved current database statistics. Check console for details.",
        });
      }
    } catch (err) {
      console.error('Error in SQL check:', err);
    }
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
            {debugMode && <TabsTrigger value="debug">Debug</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="overview">
            <MissingDataOverview 
              stats={stats} 
              onDiagnosticRun={handleDiagnosticRun}
              onRunAIProcessing={handleRunAIProcessing}
            />
            
            <div className="mt-4">
              <button 
                onClick={handleRawSqlCheck}
                className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 rounded-md"
              >
                Check Raw Database Stats
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="diagnostics">
            <MissingDataDiagnostics onDiagnosticRun={handleDiagnosticRun} />
          </TabsContent>
          
          {debugMode && (
            <TabsContent value="debug">
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Debug Information</AlertTitle>
                <AlertDescription>
                  Showing debug information about missing data in the database
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h3 className="text-md font-medium">Sample Laptops with Missing Data:</h3>
                
                {isLoadingSamples ? (
                  <p>Loading sample data...</p>
                ) : (
                  <div className="border rounded-md overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASIN</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processor</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RAM</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sampleLaptops.map(laptop => (
                          <tr key={laptop.id}>
                            <td className="px-4 py-2 text-sm">{laptop.asin}</td>
                            <td className="px-4 py-2 text-sm">{laptop.title?.substring(0, 30)}...</td>
                            <td className="px-4 py-2 text-sm">{laptop.processor || <span className="text-red-500">Missing</span>}</td>
                            <td className="px-4 py-2 text-sm">{laptop.ram || <span className="text-red-500">Missing</span>}</td>
                            <td className="px-4 py-2 text-sm">{laptop.storage || <span className="text-red-500">Missing</span>}</td>
                            <td className="px-4 py-2 text-sm">{laptop.last_checked ? new Date(laptop.last_checked).toLocaleString() : 'Never'}</td>
                            <td className="px-4 py-2 text-sm">{laptop.update_status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="p-4 bg-slate-50 rounded-md">
                  <h4 className="font-medium mb-2">Debug Notes:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Check if update-laptops edge function is extracting specifications correctly</li>
                    <li>Verify if the database is properly receiving and storing the extracted specifications</li>
                    <li>Confirm if the update process is focusing only on prices and not processing specifications</li>
                    <li>Examine the format of data being sent to the database for specifications</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
