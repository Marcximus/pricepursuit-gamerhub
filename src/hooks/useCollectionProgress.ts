
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { COLLECTION_CONFIG } from '@/utils/laptop/config';

export interface CollectionProgress {
  currentGroup: number;
  totalGroups: number;
  currentBrand: number;
  brandsInCurrentGroup: number;
  stats: {
    processed: number;
    added: number;
    updated: number;
    failed: number;
    skipped: number;
  };
}

export const useCollectionProgress = () => {
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  const [progress, setProgress] = useState<CollectionProgress | null>(null);

  useEffect(() => {
    // Function to check if there's an active collection
    const checkActiveCollection = async () => {
      try {
        // Get the current timestamp minus 30 seconds for stale check
        const staleTimeout = new Date(Date.now() - 30 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('collection_status', 'in_progress')
          .gt('last_collection_attempt', staleTimeout)
          .limit(1);
          
        if (error) {
          console.error('Error checking active collections:', error);
          return;
        }
        
        setIsCollecting(data && data.length > 0);
      } catch (error) {
        console.error('Error in checkActiveCollection:', error);
      }
    };

    // Function to fetch collection progress
    const fetchCollectionProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('collection_progress')
          .select('*')
          .eq('id', '7c75e6fe-c6b3-40be-9378-e44c8f45787d')
          .single();
  
        if (error) {
          console.error('Error fetching collection progress:', error);
          return;
        }
  
        if (data && data.progress_data) {
          const progressData = data.progress_data as any;
          
          // If progress data is not null, update state
          if (progressData) {
            const currentGroup = progressData.groupIndex + 1;
            const totalGroups = Math.ceil(COLLECTION_CONFIG.LAPTOP_BRANDS.length / COLLECTION_CONFIG.PARALLEL_BATCHES);
            
            // Calculate brands in current group
            let brandsInCurrentGroup = COLLECTION_CONFIG.PARALLEL_BATCHES;
            if (currentGroup === totalGroups) {
              // Last group may have fewer brands
              const remainingBrands = COLLECTION_CONFIG.LAPTOP_BRANDS.length % COLLECTION_CONFIG.PARALLEL_BATCHES;
              brandsInCurrentGroup = remainingBrands === 0 ? COLLECTION_CONFIG.PARALLEL_BATCHES : remainingBrands;
            }
            
            setProgress({
              currentGroup,
              totalGroups,
              currentBrand: progressData.brandIndex + 1,
              brandsInCurrentGroup,
              stats: progressData.stats || {
                processed: 0,
                added: 0,
                updated: 0,
                failed: 0,
                skipped: 0
              }
            });
          } else {
            // If progress data is null, collection is complete
            setProgress(null);
            setIsCollecting(false);
          }
        }
      } catch (error) {
        console.error('Error in fetchCollectionProgress:', error);
      }
    };

    // Check if there's an active collection
    checkActiveCollection();
    
    // If collection is in progress, set up interval to fetch progress
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isCollecting) {
      // Fetch progress immediately
      fetchCollectionProgress();
      
      // And then set up interval to fetch every 5 seconds
      intervalId = setInterval(() => {
        fetchCollectionProgress();
        checkActiveCollection();
      }, 5000);
    }
    
    // Clean up interval on unmount or when isCollecting changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCollecting]);

  return { isCollecting, progress };
};
