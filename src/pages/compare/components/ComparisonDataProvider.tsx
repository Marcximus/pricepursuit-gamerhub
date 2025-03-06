
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

export type ComparisonResult = {
  winner: 'left' | 'right' | 'tie';
  analysis: string;
  advantages: {
    left: string[];
    right: string[];
  };
  recommendation: string;
  valueForMoney: {
    left: string;
    right: string;
  };
};

interface ComparisonDataProviderProps {
  children: (props: {
    isLoading: boolean;
    error: string | null;
    comparisonResult: ComparisonResult | null;
    laptopLeft: Product | null;
    laptopRight: Product | null;
    hasSelectedLaptops: boolean;
  }) => React.ReactNode;
}

const ComparisonDataProvider: React.FC<ComparisonDataProviderProps> = ({ children }) => {
  const { selectedLaptops } = useComparison();
  const navigate = useNavigate();
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Define the laptops for easier reference
  const laptopLeft = selectedLaptops[0] || null;
  const laptopRight = selectedLaptops[1] || null;
  const hasSelectedLaptops = selectedLaptops.length === 2;
  
  // Scroll to top when component mounts or when comparison changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedLaptops]);
  
  useEffect(() => {
    // Don't fetch comparison if we don't have 2 laptops
    if (selectedLaptops.length !== 2) {
      console.log("Not enough laptops for comparison:", selectedLaptops.length);
      return;
    }
    
    console.log("Starting comparison with laptops:", selectedLaptops);
    
    const fetchComparison = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Sending laptops for comparison:', laptopLeft?.id, laptopRight?.id);
        
        const { data, error } = await supabase.functions.invoke('compare-laptops', {
          body: { 
            laptopLeft: {
              // Send ALL available data for better comparison
              id: laptopLeft?.id,
              brand: laptopLeft?.brand,
              model: laptopLeft?.model || '',
              title: laptopLeft?.title || '',
              processor: laptopLeft?.processor || '',
              ram: laptopLeft?.ram || '',
              storage: laptopLeft?.storage || '',
              graphics: laptopLeft?.graphics || '',
              screen_size: laptopLeft?.screen_size || '',
              screen_resolution: laptopLeft?.screen_resolution || '',
              weight: laptopLeft?.weight || '',
              battery_life: laptopLeft?.battery_life || '',
              price: laptopLeft?.current_price || 0,
              original_price: laptopLeft?.original_price || 0,
              rating: laptopLeft?.rating || 0,
              rating_count: laptopLeft?.rating_count || 0,
              benchmark_score: laptopLeft?.benchmark_score || 0,
              wilson_score: laptopLeft?.wilson_score || 0
            },
            laptopRight: {
              // Send ALL available data for better comparison
              id: laptopRight?.id,
              brand: laptopRight?.brand,
              model: laptopRight?.model || '',
              title: laptopRight?.title || '',
              processor: laptopRight?.processor || '',
              ram: laptopRight?.ram || '',
              storage: laptopRight?.storage || '',
              graphics: laptopRight?.graphics || '',
              screen_size: laptopRight?.screen_size || '',
              screen_resolution: laptopRight?.screen_resolution || '',
              weight: laptopRight?.weight || '',
              battery_life: laptopRight?.battery_life || '',
              price: laptopRight?.current_price || 0,
              original_price: laptopRight?.original_price || 0,
              rating: laptopRight?.rating || 0,
              rating_count: laptopRight?.rating_count || 0,
              benchmark_score: laptopRight?.benchmark_score || 0,
              wilson_score: laptopRight?.wilson_score || 0
            }
          }
        });
        
        if (error) throw error;
        
        console.log('Comparison result received:', data);
        setComparisonResult(data);
      } catch (err) {
        console.error('Error fetching comparison:', err);
        setError('Failed to compare laptops. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComparison();
  }, [selectedLaptops, laptopLeft, laptopRight]);
  
  return (
    <>
      {children({
        isLoading,
        error,
        comparisonResult,
        laptopLeft,
        laptopRight,
        hasSelectedLaptops
      })}
    </>
  );
};

export default ComparisonDataProvider;
