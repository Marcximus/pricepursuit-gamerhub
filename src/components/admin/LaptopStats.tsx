
import React from 'react';
import { StatsProvider, StatsRefreshContext, useStats } from './stats/StatsContext';
import { StatsHeader } from './stats/StatsHeader';
import { StatsAutoRefresh } from './stats/StatsAutoRefresh';
import { StatsTabs } from './stats/StatsTabs';
import { StatsInitializer } from './stats/StatsInitializer';
import { LoadingState } from './stats/LoadingState';
import { ErrorState } from './stats/ErrorState';

// Inner component to access context
const StatsContent = () => {
  const { loading, error, stats, fetchStats } = useStats();

  if (loading && !stats) {
    return <LoadingState message="Loading database statistics..." />;
  }

  if (error && !stats) {
    return <ErrorState message="Failed to load database statistics" error={error} />;
  }

  return (
    <StatsRefreshContext.Provider value={fetchStats}>
      <StatsHeader />
      <StatsAutoRefresh />
      <StatsInitializer />
      <StatsTabs />
    </StatsRefreshContext.Provider>
  );
};

// Main component that provides the context
const LaptopStats = () => {
  return (
    <StatsProvider>
      <div className="w-full space-y-4 mt-4">
        <StatsContent />
      </div>
    </StatsProvider>
  );
};

export default LaptopStats;
