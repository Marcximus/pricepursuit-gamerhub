
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import type { LaptopSpecifications } from "../types";

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
  specifications: {
    left: LaptopSpecifications;
    right: LaptopSpecifications;
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
  
  // This effect checks if we have the required laptops after mounting
  useEffect(() => {
    // Log the current state to help with debugging
    console.log("ComparisonDataProvider - Selected laptops count:", selectedLaptops.length);
    console.log("Has left laptop:", !!laptopLeft?.asin);
    console.log("Has right laptop:", !!laptopRight?.asin);
  }, []);
  
  // This effect automatically triggers the comparison when we have 2 laptops
  useEffect(() => {
    // Don't fetch comparison if we don't have 2 laptops
    if (selectedLaptops.length !== 2) {
      console.log("Not enough laptops for comparison:", selectedLaptops.length);
      return;
    }
    
    // Clear any previous results when laptops change
    if (comparisonResult) {
      setComparisonResult(null);
    }
    
    console.log("Starting comparison with laptops:", selectedLaptops);
    
    const fetchComparison = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Sending ASINs for comparison:', laptopLeft?.asin, laptopRight?.asin);
        
        // Send only the ASINs to the edge function which will fetch fresh data
        const { data, error } = await supabase.functions.invoke('compare-laptops', {
          body: {
            leftAsin: laptopLeft?.asin,
            rightAsin: laptopRight?.asin
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
