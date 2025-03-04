
import React, { useState, useEffect } from "react";
import { useComparison } from "@/contexts/ComparisonContext";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

export interface ComparisonResult {
  winner: "left" | "right" | "tie";
  summary: string;
  leftAdvantages: string[];
  rightAdvantages: string[];
  valueProposition: {
    better_value: "left" | "right" | "tie";
    explanation: string;
  };
  useCases: {
    left: string[];
    right: string[];
  };
  detailed_analysis: string;
}

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [laptopLeft, setLaptopLeft] = useState<Product | null>(null);
  const [laptopRight, setLaptopRight] = useState<Product | null>(null);
  const [enhancedSpecsLeft, setEnhancedSpecsLeft] = useState<Record<string, any> | null>(null);
  const [enhancedSpecsRight, setEnhancedSpecsRight] = useState<Record<string, any> | null>(null);
  const { toast } = useToast();
  
  // Fetch detailed laptop data when selected laptops change
  useEffect(() => {
    const fetchLaptopDetails = async () => {
      if (selectedLaptops.length === 2) {
        try {
          // Get detailed product information from Supabase
          const { data: leftData, error: leftError } = await supabase
            .from("products")
            .select("*")
            .eq("id", selectedLaptops[0].id)
            .single();
            
          const { data: rightData, error: rightError } = await supabase
            .from("products")
            .select("*")
            .eq("id", selectedLaptops[1].id)
            .single();
            
          if (leftError) throw new Error(`Error fetching left laptop: ${leftError.message}`);
          if (rightError) throw new Error(`Error fetching right laptop: ${rightError.message}`);
          
          setLaptopLeft(leftData);
          setLaptopRight(rightData);
          
          // Now fetch enhanced specifications from RapidAPI
          if (leftData?.asin && rightData?.asin) {
            fetchEnhancedSpecs(leftData.asin, rightData.asin);
          }
          
        } catch (err) {
          console.error("Error fetching laptop details:", err);
          setError(`Failed to fetch laptop details: ${err.message}`);
        }
      } else {
        setLaptopLeft(null);
        setLaptopRight(null);
        setComparisonResult(null);
        setEnhancedSpecsLeft(null);
        setEnhancedSpecsRight(null);
      }
    };
    
    fetchLaptopDetails();
  }, [selectedLaptops]);
  
  // Fetch enhanced specs from the RapidAPI service
  const fetchEnhancedSpecs = async (leftAsin: string, rightAsin: string) => {
    try {
      const response = await fetch('/api/fetch-product-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asins: [leftAsin, rightAsin] })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch enhanced specs');
      }
      
      const enhancedSpecs = await response.json();
      
      if (Array.isArray(enhancedSpecs) && enhancedSpecs.length === 2) {
        // Find which spec corresponds to which laptop
        const leftSpec = enhancedSpecs.find(spec => spec?.asin === leftAsin) || null;
        const rightSpec = enhancedSpecs.find(spec => spec?.asin === rightAsin) || null;
        
        setEnhancedSpecsLeft(leftSpec);
        setEnhancedSpecsRight(rightSpec);
      } else if (enhancedSpecs && !Array.isArray(enhancedSpecs)) {
        // Handle case where only one result is returned
        if (enhancedSpecs.asin === leftAsin) {
          setEnhancedSpecsLeft(enhancedSpecs);
        } else if (enhancedSpecs.asin === rightAsin) {
          setEnhancedSpecsRight(enhancedSpecs);
        }
      }
    } catch (err) {
      console.error("Error fetching enhanced specs:", err);
      toast({
        title: "Enhanced data error",
        description: "Could not fetch enhanced specifications. Using basic data only.",
        variant: "destructive"
      });
    }
  };
  
  // Compare laptops when both laptops are loaded
  useEffect(() => {
    const compareLaptops = async () => {
      if (laptopLeft && laptopRight) {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/compare-laptops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ laptopLeft, laptopRight })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Comparison failed');
          }
          
          const result = await response.json();
          setComparisonResult(result);
        } catch (err) {
          console.error("Error comparing laptops:", err);
          setError(err.message || 'Failed to compare laptops');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    compareLaptops();
  }, [laptopLeft, laptopRight]);
  
  const hasSelectedLaptops = selectedLaptops.length === 2;
  
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
