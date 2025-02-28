
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { getSampleLaptopsWithMissingData } from '@/utils/laptop/stats/basicCountQueries';

export function DiagnosticTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      const sampleData = await getSampleLaptopsWithMissingData(20);
      setResults(sampleData);
    } catch (error) {
      console.error('Error running diagnostic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMissingFieldCount = (laptop: any) => {
    let count = 0;
    if (!laptop.processor) count++;
    if (!laptop.ram) count++;
    if (!laptop.storage) count++;
    if (!laptop.graphics) count++;
    if (!laptop.screen_size) count++;
    if (!laptop.image_url) count++;
    if (!laptop.current_price) count++;
    return count;
  };

  const getSeverityClass = (laptop: any) => {
    const missingCount = getMissingFieldCount(laptop);
    if (missingCount >= 5) return "border-l-4 border-red-500";
    if (missingCount >= 3) return "border-l-4 border-orange-500";
    if (missingCount >= 1) return "border-l-4 border-yellow-500";
    return "border-l-4 border-green-500";
  };

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(laptop => {
        if (activeTab === 'missing-images') return !laptop.image_url;
        if (activeTab === 'missing-specs') 
          return !laptop.processor || !laptop.ram || !laptop.storage || !laptop.graphics || !laptop.screen_size;
        if (activeTab === 'missing-prices') return !laptop.current_price;
        return true;
      });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Laptop Data Diagnostic Tool</h3>
        <Button onClick={runDiagnostic} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Running Diagnostic..." : "Run Diagnostic"}
        </Button>
      </div>

      {results.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All Issues ({results.length})</TabsTrigger>
            <TabsTrigger value="missing-images">
              Missing Images ({results.filter(l => !l.image_url).length})
            </TabsTrigger>
            <TabsTrigger value="missing-specs">
              Missing Specs ({results.filter(l => !l.processor || !l.ram || !l.storage || !l.graphics || !l.screen_size).length})
            </TabsTrigger>
            <TabsTrigger value="missing-prices">
              Missing Prices ({results.filter(l => !l.current_price).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-3 max-h-[400px] overflow-auto p-2">
              {filteredResults.length === 0 ? (
                <div className="text-center p-4">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p>No issues found in this category!</p>
                </div>
              ) : (
                filteredResults.map(laptop => (
                  <Card 
                    key={laptop.id} 
                    className={`p-3 ${getSeverityClass(laptop)}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <h4 className="font-medium text-sm mb-1 truncate">{laptop.title || 'No Title'}</h4>
                        <p className="text-xs text-muted-foreground mb-1">ASIN: {laptop.asin}</p>
                        <p className="text-xs text-muted-foreground">
                          Last Checked: {laptop.last_checked 
                            ? new Date(laptop.last_checked).toLocaleString() 
                            : 'Never'}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className={laptop.processor ? "text-green-600" : "text-red-500"}>
                          {laptop.processor ? "✓ Processor" : "✗ No Processor"}
                        </div>
                        <div className={laptop.ram ? "text-green-600" : "text-red-500"}>
                          {laptop.ram ? "✓ RAM" : "✗ No RAM"}
                        </div>
                        <div className={laptop.storage ? "text-green-600" : "text-red-500"}>
                          {laptop.storage ? "✓ Storage" : "✗ No Storage"}
                        </div>
                        <div className={laptop.graphics ? "text-green-600" : "text-red-500"}>
                          {laptop.graphics ? "✓ Graphics" : "✗ No Graphics"}
                        </div>
                        <div className={laptop.screen_size ? "text-green-600" : "text-red-500"}>
                          {laptop.screen_size ? "✓ Screen" : "✗ No Screen"}
                        </div>
                        <div className={laptop.image_url ? "text-green-600" : "text-red-500"}>
                          {laptop.image_url ? "✓ Image" : "✗ No Image"}
                        </div>
                        <div className={laptop.current_price ? "text-green-600" : "text-red-500 col-span-3"}>
                          {laptop.current_price 
                            ? `✓ Price: $${laptop.current_price}` 
                            : "✗ No Price"}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {results.length === 0 && !isLoading && (
        <div className="text-center p-8 bg-muted rounded-md">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
          <h4 className="text-lg font-medium mb-2">No Diagnostic Data</h4>
          <p className="text-muted-foreground">
            Run the diagnostic tool to analyze laptops with missing information
          </p>
        </div>
      )}
    </div>
  );
}

export default DiagnosticTool;
