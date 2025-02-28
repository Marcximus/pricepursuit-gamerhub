
import React, { createContext, useContext } from 'react';
import { StatsContextType, defaultStatsContextValue } from './StatsContextTypes';
import { useStatsFetcher } from './useStatsFetcher';

// Create the context with a default value
const StatsContext = createContext<StatsContextType>(defaultStatsContextValue);

// Create a context specifically for the refresh function to maintain backward compatibility
export const StatsRefreshContext = createContext<() => Promise<void>>(async () => {});

// Custom hook to use the stats context
export const useStats = () => useContext(StatsContext);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    stats,
    loading,
    setLoading,
    error,
    refreshing,
    lastRefreshTime,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    fetchStats,
  } = useStatsFetcher();

  // Context value
  const value: StatsContextType = {
    stats,
    loading,
    setLoading,
    error,
    refreshing,
    lastRefreshTime,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    fetchStats
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};
