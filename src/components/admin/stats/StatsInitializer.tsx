
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
        
        // Set a timeout to make sure we don't get stuck in loading state
        const timeoutId = setTimeout(() => {
          console.warn('StatsInitializer: Fetch timeout reached, forcing loading state to false');
          setLoading(false);
        }, 15000); // 15 second timeout
        
        await fetchStats();
        clearTimeout(timeoutId);
        
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
