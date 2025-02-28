
import { useEffect } from 'react';
import { useStats } from './StatsContext';

export const StatsInitializer: React.FC = () => {
  const { fetchStats, setLoading, loading } = useStats();

  // Initial data fetch
  useEffect(() => {
    const initialFetch = async () => {
      try {
        if (!loading) return; // Skip if not in loading state (already initialized)
        
        console.log('StatsInitializer: Starting initial fetch');
        await fetchStats();
        console.log('StatsInitializer: Initial fetch completed');
      } catch (error) {
        console.error("StatsInitializer: Initial fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initialFetch();
    // This effect should only run once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // This is a logic-only component, no UI
};
