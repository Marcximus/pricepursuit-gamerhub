
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLaptops } from "@/hooks/useLaptops";
import { Loader2, Database, Clock, AlertCircle, CheckSquare, Search, MinusCircle } from "lucide-react";

interface StatsData {
  totalLaptops: number;
  updateStatus: {
    notUpdated: { count: number; percentage: number };
    notChecked: { count: number; percentage: number };
  };
  aiProcessingStatus: {
    pending: { count: number; percentage: number };
    processing: { count: number; percentage: number };
    error: { count: number; percentage: number };
    complete: { count: number; percentage: number };
    completionPercentage: number;
  };
  missingInformation: {
    prices: { count: number; percentage: number };
    processor: { count: number; percentage: number };
    ram: { count: number; percentage: number };
    storage: { count: number; percentage: number };
    graphics: { count: number; percentage: number };
    screenSize: { count: number; percentage: number };
  };
}

export function LaptopStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getDatabaseStats } = useLaptops();

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const statsData = await getDatabaseStats();
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [getDatabaseStats]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
          <CardDescription>Loading latest statistics...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
          <CardDescription>Error loading statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Statistics</CardTitle>
        <CardDescription>Overview of laptop database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Database Overview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Database Overview</h3>
            
            <div className="space-y-2">
              <StatItem 
                icon={<Database className="h-4 w-4 text-blue-500" />}
                label="Total Laptops"
                value={stats.totalLaptops}
              />
              
              <StatItem 
                icon={<Clock className="h-4 w-4 text-amber-500" />}
                label="Not Updated (24h)"
                value={stats.updateStatus.notUpdated.count}
              />
              
              <StatItem 
                icon={<Clock className="h-4 w-4 text-amber-500" />}
                label="Not Checked (24h)"
                value={stats.updateStatus.notChecked.count}
              />
            </div>
          </div>
          
          {/* AI Processing Status Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">AI Processing Status</h3>
            
            <div className="space-y-2">
              <StatItem 
                icon={<Search className="h-4 w-4 text-slate-500" />}
                label="Pending"
                value={stats.aiProcessingStatus.pending.count}
              />
              
              <StatItem 
                icon={<Loader2 className="h-4 w-4 text-blue-500" />}
                label="Processing"
                value={stats.aiProcessingStatus.processing.count}
              />
              
              <StatItem 
                icon={<AlertCircle className="h-4 w-4 text-red-500" />}
                label="Error"
                value={stats.aiProcessingStatus.error.count}
              />
              
              <StatItem 
                icon={<CheckSquare className="h-4 w-4 text-green-500" />}
                label="Complete"
                value={stats.aiProcessingStatus.complete.count}
              />
              
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Processing Completion</span>
                  <span className="text-sm font-medium">{stats.aiProcessingStatus.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stats.aiProcessingStatus.completionPercentage >= 75 ? 'bg-green-500' : 
                      stats.aiProcessingStatus.completionPercentage >= 50 ? 'bg-blue-500' : 
                      stats.aiProcessingStatus.completionPercentage >= 25 ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${stats.aiProcessingStatus.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Missing Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Missing Information</h3>
            
            <div className="space-y-3">
              <MissingDataItem 
                label="Missing Prices"
                percentage={stats.missingInformation.prices.percentage}
              />
              
              <MissingDataItem 
                label="Missing Processor"
                percentage={stats.missingInformation.processor.percentage}
              />
              
              <MissingDataItem 
                label="Missing RAM"
                percentage={stats.missingInformation.ram.percentage}
              />
              
              <MissingDataItem 
                label="Missing Storage"
                percentage={stats.missingInformation.storage.percentage}
              />
              
              <MissingDataItem 
                label="Missing Graphics"
                percentage={stats.missingInformation.graphics.percentage}
              />
              
              <MissingDataItem 
                label="Missing Screen Size"
                percentage={stats.missingInformation.screenSize.percentage}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="font-medium">{value.toLocaleString()}</span>
    </div>
  );
}

function MissingDataItem({ 
  label, 
  percentage
}: { 
  label: string; 
  percentage: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MinusCircle className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <span 
          className={`text-sm font-medium ${
            percentage >= 50 ? 'text-red-600' : 
            percentage >= 20 ? 'text-amber-600' : 
            'text-green-600'
          }`}
        >
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${
            percentage >= 50 ? 'bg-red-500' : 
            percentage >= 20 ? 'bg-amber-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
