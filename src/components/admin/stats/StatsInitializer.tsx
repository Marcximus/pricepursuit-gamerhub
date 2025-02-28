
import { useEffect } from 'react';
import { useStats } from './StatsContext';

export const StatsInitializer: React.FC = () => {
  const { fetchStats, setLoading } = useStats();

  // Initial data fetch
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true);
        await fetchStats();
      } catch (error) {
        console.error("Initial fetch error:", error);
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
