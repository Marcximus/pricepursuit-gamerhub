
import { DatabaseStats } from "@/utils/laptop/stats/types";

// Define the context types
export type StatsContextType = {
  stats: DatabaseStats | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: Error | null;
  refreshing: boolean;
  lastRefreshTime: Date;
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  fetchStats: () => Promise<void>;
};

// Default context value
export const defaultStatsContextValue: StatsContextType = {
  stats: null,
  loading: true,
  setLoading: () => {},
  error: null,
  refreshing: false,
  lastRefreshTime: new Date(),
  autoRefreshEnabled: true,
  setAutoRefreshEnabled: () => {},
  fetchStats: async () => {},
};
