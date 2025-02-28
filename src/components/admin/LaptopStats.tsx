
import React, { useCallback } from 'react';
import { StatsProvider, StatsRefreshContext } from './stats/StatsContext';
import { StatsHeader } from './stats/StatsHeader';
import { StatsAutoRefresh } from './stats/StatsAutoRefresh';
import { StatsTabs } from './stats/StatsTabs';
import { StatsInitializer } from './stats/StatsInitializer';
import { LoadingState } from './stats/LoadingState';
import { ErrorState } from './stats/ErrorState';
import { useStats } from './stats/StatsContext';

// Inner component to access context
const StatsContent = () => {
  const { loading, error, stats } = useStats();

  if (loading && !stats) {
    return <LoadingState message="Loading database statistics..." />;
  }

  if (error && !stats) {
    return <ErrorState message="Failed to load database statistics" error={error} />;
  }

  return (
    <>
      <StatsHeader />
      <StatsAutoRefresh />
      <StatsInitializer />
      <StatsTabs />
    </>
  );
};

// Main component that provides the context
const LaptopStats = () => {
  return (
    <StatsProvider>
      <LaptopStatsWithContext />
    </StatsProvider>
  );
};

// Helper component to wrap the content with the legacy context provider
const LaptopStatsWithContext = () => {
  const { fetchStats } = useStats();
  
  return (
    <StatsRefreshContext.Provider value={fetchStats}>
      <div className="w-full space-y-4 mt-4">
        <StatsContent />
      </div>
    </StatsRefreshContext.Provider>
  );
};

export default LaptopStats;
