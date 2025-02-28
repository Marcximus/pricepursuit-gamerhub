
import { useEffect } from 'react';
import { useStats } from './StatsContext';

export const StatsAutoRefresh: React.FC = () => {
  const { stats, autoRefreshEnabled, fetchStats } = useStats();

  // Set up auto-refresh interval based on update activity with proper cleanup
  useEffect(() => {
    // Skip if auto-refresh is disabled
    if (!autoRefreshEnabled) {
      console.log('Auto-refresh is disabled');
      return;
    }
    
    // Only run if we have stats
    if (!stats) return;
    
    // Determine if we have active updates
    const hasActiveUpdates = stats.updateStatus?.inProgress?.count > 0;
    
    // Set refresh interval: 5s when updates happening, 30s when idle
    const refreshInterval = hasActiveUpdates ? 5000 : 30000;
    
    console.log(`Setting up stats refresh interval: ${refreshInterval}ms, active updates: ${hasActiveUpdates}`);
    
    // Create interval for auto-refresh
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing stats...');
      fetchStats().catch(err => {
        console.error('Auto-refresh error:', err);
      });
    }, refreshInterval);
    
    // Clean up interval when component unmounts or dependencies change
    return () => {
      console.log('Cleaning up refresh interval');
      clearInterval(intervalId);
    };
  }, [stats, fetchStats, autoRefreshEnabled]);

  return null; // This is a logic-only component, no UI
};
