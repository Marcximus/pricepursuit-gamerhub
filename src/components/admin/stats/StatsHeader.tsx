
import React from 'react';
import { useStats } from './StatsContext';
import { useToast } from '@/components/ui/use-toast';

export const StatsHeader: React.FC = () => {
  const { lastRefreshTime, autoRefreshEnabled, setAutoRefreshEnabled, fetchStats, refreshing } = useStats();
  const { toast } = useToast();

  const handleManualRefresh = async () => {
    if (!refreshing) {
      try {
        console.log('Manual refresh triggered');
        await fetchStats();
        toast({
          title: "Stats Updated",
          description: "Database statistics refreshed successfully",
        });
      } catch (error) {
        console.error("Manual refresh error:", error);
      }
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    toast({
      title: autoRefreshEnabled ? "Auto-refresh disabled" : "Auto-refresh enabled",
      description: autoRefreshEnabled 
        ? "You'll need to manually refresh statistics" 
        : "Statistics will refresh automatically",
    });
  };

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold">Database Statistics</h2>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500">
          Last refreshed: {lastRefreshTime.toLocaleTimeString()}
        </span>
        <div className="flex space-x-2">
          <button 
            onClick={toggleAutoRefresh} 
            className={`px-3 py-1.5 text-xs rounded-md ${
              autoRefreshEnabled 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button 
            onClick={handleManualRefresh} 
            disabled={refreshing}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center space-x-1"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Refreshing...</span>
              </>
            ) : (
              <span>Refresh Stats</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
