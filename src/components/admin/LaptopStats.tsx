
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLaptops } from "@/hooks/useLaptops";
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { DatabaseOverview } from "./stats/DatabaseOverview";
import { AiProcessingStatus } from "./stats/AiProcessingStatus";
import { MissingInformation } from "./stats/MissingInformation";
import { LoadingState } from "./stats/LoadingState";
import { ErrorState } from "./stats/ErrorState";
import { EmptyState } from "./stats/EmptyState";

export function LaptopStats() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
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
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!stats) {
    return <EmptyState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Statistics</CardTitle>
        <CardDescription>Overview of laptop database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <DatabaseOverview stats={stats} />
          <AiProcessingStatus stats={stats} />
          <MissingInformation stats={stats} />
        </div>
      </CardContent>
    </Card>
  );
}
