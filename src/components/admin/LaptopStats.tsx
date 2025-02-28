
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowDownIcon, DatabaseIcon, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDatabaseStats, type DatabaseStats } from "@/utils/laptop/getDatabaseStats";

export function LaptopStats() {
  const [stats, setStats] = useState<DatabaseStats>({
    totalLaptops: 0,
    missingPrices: 0,
    missingProcessor: 0,
    missingRam: 0,
    missingStorage: 0,
    missingGraphics: 0,
    missingScreenSize: 0,
    notUpdated24h: 0,
    notChecked24h: 0,
    aiPending: 0,
    aiProcessing: 0,
    aiError: 0,
    aiComplete: 0,
    loading: true,
    error: null
  });

  const fetchStats = async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    try {
      const newStats = await getDatabaseStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load statistics' 
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Calculate percentages for progress bars
  const getPercentage = (value: number) => {
    return stats.totalLaptops > 0 ? Math.round((value / stats.totalLaptops) * 100) : 0;
  };

  // Calculate AI processing completion percentage
  const aiCompletionPercentage = stats.totalLaptops > 0 
    ? Math.round((stats.aiComplete / stats.totalLaptops) * 100) 
    : 0;

  if (stats.error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading statistics: {stats.error}</AlertDescription>
        <Button onClick={fetchStats} variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Database Statistics</h2>
        <Button 
          onClick={fetchStats} 
          variant="outline" 
          size="sm"
          disabled={stats.loading}
        >
          {stats.loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Database Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-500">Total Laptops</span>
              <span className="font-medium">{stats.totalLaptops}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-500">Not Updated (24h)</span>
              <span className="font-medium">{stats.notUpdated24h}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-500">Not Checked (24h)</span>
              <span className="font-medium">{stats.notChecked24h}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-500">Pending</span>
              <span className="font-medium">{stats.aiPending}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-500">Processing</span>
              <span className="font-medium">{stats.aiProcessing}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-500">Error</span>
              <span className="font-medium">{stats.aiError}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-500">Complete</span>
              <span className="font-medium">{stats.aiComplete}</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Processing Completion</span>
                <span>{aiCompletionPercentage}%</span>
              </div>
              <Progress value={aiCompletionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Missing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Missing Prices</span>
                <span>{getPercentage(stats.missingPrices)}%</span>
              </div>
              <Progress value={getPercentage(stats.missingPrices)} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Missing Processor</span>
                <span>{getPercentage(stats.missingProcessor)}%</span>
              </div>
              <Progress value={getPercentage(stats.missingProcessor)} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Missing RAM</span>
                <span>{getPercentage(stats.missingRam)}%</span>
              </div>
              <Progress value={getPercentage(stats.missingRam)} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Missing Storage</span>
                <span>{getPercentage(stats.missingStorage)}%</span>
              </div>
              <Progress value={getPercentage(stats.missingStorage)} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Missing Graphics</span>
                <span>{getPercentage(stats.missingGraphics)}%</span>
              </div>
              <Progress value={getPercentage(stats.missingGraphics)} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Missing Screen Size</span>
                <span>{getPercentage(stats.missingScreenSize)}%</span>
              </div>
              <Progress value={getPercentage(stats.missingScreenSize)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
