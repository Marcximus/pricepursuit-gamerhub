
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import { toast } from "sonner";

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
    enhancedSpecsLeft: Record<string, any> | null;
    enhancedSpecsRight: Record<string, any> | null;
  }) => React.ReactNode;
}

const ComparisonDataProvider: React.FC<ComparisonDataProviderProps> = ({ children }) => {
  const { selectedLaptops } = useComparison();
  const navigate = useNavigate();
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancedSpecsLeft, setEnhancedSpecsLeft] = useState<Record<string, any> | null>(null);
  const [enhancedSpecsRight, setEnhancedSpecsRight] = useState<Record<string, any> | null>(null);
  
  // Define the laptops for easier reference
  const laptopLeft = selectedLaptops[0] || null;
  const laptopRight = selectedLaptops[1] || null;
  const hasSelectedLaptops = selectedLaptops.length === 2;
  
  // Fetch enhanced product details
  useEffect(() => {
    if (!hasSelectedLaptops) return;
    
    const fetchEnhancedDetails = async () => {
      try {
        const asins = [
          laptopLeft?.asin, 
          laptopRight?.asin
        ].filter(Boolean) as string[];
        
        if (asins.length !== 2) {
          console.warn("Missing ASINs for one or both laptops");
          return;
        }
        
        console.log("Fetching enhanced details for ASINs:", asins);
        
        const { data, error } = await supabase.functions.invoke('fetch-product-details', {
          body: { asins }
        });
        
        if (error) {
          console.error("Error fetching enhanced details:", error);
          toast.error("Failed to fetch enhanced product details");
          return;
        }
        
        if (data && laptopLeft?.asin && data[laptopLeft.asin]) {
          setEnhancedSpecsLeft(data[laptopLeft.asin]);
        }
        
        if (data && laptopRight?.asin && data[laptopRight.asin]) {
          setEnhancedSpecsRight(data[laptopRight.asin]);
        }
        
        console.log("Enhanced specs loaded:", data);
      } catch (err) {
        console.error("Error in fetchEnhancedDetails:", err);
      }
    };
    
    fetchEnhancedDetails();
  }, [laptopLeft, laptopRight, hasSelectedLaptops]);
  
  useEffect(() => {
    // Don't redirect, just don't fetch comparison if we don't have 2 laptops
    if (selectedLaptops.length !== 2) {
      return;
    }
    
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
  }, [selectedLaptops, navigate, laptopLeft, laptopRight]);
  
  return (
    <>
      {children({
        isLoading,
        error,
        comparisonResult,
        laptopLeft,
        laptopRight,
        hasSelectedLaptops,
        enhancedSpecsLeft,
        enhancedSpecsRight
      })}
    </>
  );
};

export default ComparisonDataProvider;
