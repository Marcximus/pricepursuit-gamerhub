
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLaptops } from "@/hooks/useLaptops";
import { Loader2 } from "lucide-react";

interface StatsData {
  totalLaptops: number;
  withPrice: { count: number; percentage: number };
  withProcessor: { count: number; percentage: number };
  withRam: { count: number; percentage: number };
  withStorage: { count: number; percentage: number };
  withGraphics: { count: number; percentage: number };
  withScreenSize: { count: number; percentage: number };
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
        <CardDescription>Overview of laptop data completeness</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Products"
            value={stats.totalLaptops}
            description="Laptops in database"
          />
          <StatCard
            title="With Price"
            value={stats.withPrice.count}
            percentage={stats.withPrice.percentage}
            description="Have pricing information"
          />
          <StatCard
            title="With Processor"
            value={stats.withProcessor.count}
            percentage={stats.withProcessor.percentage}
            description="Have processor information"
          />
          <StatCard
            title="With RAM"
            value={stats.withRam.count}
            percentage={stats.withRam.percentage}
            description="Have RAM information"
          />
          <StatCard
            title="With Storage"
            value={stats.withStorage.count}
            percentage={stats.withStorage.percentage}
            description="Have storage information"
          />
          <StatCard
            title="With Graphics"
            value={stats.withGraphics.count}
            percentage={stats.withGraphics.percentage}
            description="Have graphics information"
          />
          <StatCard
            title="With Screen Size"
            value={stats.withScreenSize.count}
            percentage={stats.withScreenSize.percentage}
            description="Have screen size information"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ 
  title, 
  value, 
  percentage, 
  description 
}: { 
  title: string; 
  value: number; 
  percentage?: number; 
  description: string 
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className="mt-1 flex items-baseline">
        <div className="text-2xl font-semibold">{value.toLocaleString()}</div>
        {percentage !== undefined && (
          <div className={`ml-2 text-sm font-medium ${percentage >= 85 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
            {percentage}%
          </div>
        )}
      </div>
      <div className="mt-1 text-xs text-gray-500">{description}</div>
      {percentage !== undefined && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${percentage >= 85 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
