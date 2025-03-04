
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useComparison } from "@/contexts/ComparisonContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, compareProcessors, compareRAM, compareStorage, comparePrices, compareRatings } from "./utils/comparisonHelpers";

// Component imports
import ComparisonHeader from "./components/ComparisonHeader";
import LaptopCard from "./components/LaptopCard";
import AnalysisSection from "./components/AnalysisSection";
import SpecificationsSection from "./components/SpecificationsSection";

// Types
type ComparisonResult = {
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

const ComparePage = () => {
  const { selectedLaptops, clearComparison } = useComparison();
  const navigate = useNavigate();
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Define the laptops for easier reference
  const laptopLeft = selectedLaptops[0];
  const laptopRight = selectedLaptops[1];
  
  useEffect(() => {
    // Redirect if we don't have exactly 2 laptops
    if (selectedLaptops.length !== 2) {
      navigate('/');
      return;
    }
    
    const fetchComparison = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.functions.invoke('compare-laptops', {
          body: { 
            laptopLeft: {
              id: laptopLeft.id,
              brand: laptopLeft.brand,
              model: laptopLeft.model || '',
              title: laptopLeft.title || '',
              processor: laptopLeft.processor || '',
              ram: laptopLeft.ram || '',
              storage: laptopLeft.storage || '',
              graphics: laptopLeft.graphics || '',
              screen_size: laptopLeft.screen_size || '',
              screen_resolution: laptopLeft.screen_resolution || '',
              price: laptopLeft.current_price || 0,
              rating: laptopLeft.rating || 0,
              rating_count: laptopLeft.rating_count || 0
            },
            laptopRight: {
              id: laptopRight.id,
              brand: laptopRight.brand,
              model: laptopRight.model || '',
              title: laptopRight.title || '',
              processor: laptopRight.processor || '',
              ram: laptopRight.ram || '',
              storage: laptopRight.storage || '',
              graphics: laptopRight.graphics || '',
              screen_size: laptopRight.screen_size || '',
              screen_resolution: laptopRight.screen_resolution || '',
              price: laptopRight.current_price || 0,
              rating: laptopRight.rating || 0,
              rating_count: laptopRight.rating_count || 0
            }
          }
        });
        
        if (error) throw error;
        
        setComparisonResult(data);
      } catch (err) {
        console.error('Error fetching comparison:', err);
        setError('Failed to compare laptops. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComparison();
  }, [selectedLaptops, navigate]);
  
  const handleGoBack = () => {
    navigate('/');
  };
  
  const handleClearAndGoBack = () => {
    clearComparison();
    navigate('/');
  };
  
  // Define comparison sections
  const comparisonSections = [
    {
      title: 'Brand & Model',
      leftValue: `${laptopLeft?.brand || 'N/A'} ${laptopLeft?.model || ''}`,
      rightValue: `${laptopRight?.brand || 'N/A'} ${laptopRight?.model || ''}`,
    },
    {
      title: 'Processor',
      leftValue: laptopLeft?.processor || 'Not Specified',
      rightValue: laptopRight?.processor || 'Not Specified',
      compare: compareProcessors
    },
    {
      title: 'RAM',
      leftValue: laptopLeft?.ram || 'Not Specified',
      rightValue: laptopRight?.ram || 'Not Specified',
      compare: compareRAM
    },
    {
      title: 'Storage',
      leftValue: laptopLeft?.storage || 'Not Specified',
      rightValue: laptopRight?.storage || 'Not Specified',
      compare: compareStorage
    },
    {
      title: 'Graphics',
      leftValue: laptopLeft?.graphics || 'Not Specified',
      rightValue: laptopRight?.graphics || 'Not Specified',
    },
    {
      title: 'Display',
      leftValue: `${laptopLeft?.screen_size || 'N/A'} ${laptopLeft?.screen_resolution ? `(${laptopLeft.screen_resolution})` : ''}`,
      rightValue: `${laptopRight?.screen_size || 'N/A'} ${laptopRight?.screen_resolution ? `(${laptopRight.screen_resolution})` : ''}`,
    },
    {
      title: 'Price',
      leftValue: formatPrice(laptopLeft?.current_price),
      rightValue: formatPrice(laptopRight?.current_price),
      compare: comparePrices
    },
    {
      title: 'Rating',
      leftValue: laptopLeft?.rating ? `${laptopLeft.rating}/5 (${laptopLeft.rating_count} reviews)` : 'No ratings',
      rightValue: laptopRight?.rating ? `${laptopRight.rating}/5 (${laptopRight.rating_count} reviews)` : 'No ratings',
      compare: compareRatings
    },
  ];
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ComparisonHeader 
            handleGoBack={handleGoBack} 
            handleClearAndGoBack={handleClearAndGoBack} 
          />
          
          <h1 className="text-2xl font-bold mb-6">Laptop Comparison</h1>
          
          {/* Product Header Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <LaptopCard 
              laptop={laptopLeft}
              isWinner={comparisonResult?.winner === 'left'}
              formatPrice={formatPrice}
            />
            
            <LaptopCard 
              laptop={laptopRight}
              isWinner={comparisonResult?.winner === 'right'}
              formatPrice={formatPrice}
            />
          </div>
          
          {/* AI Analysis Section */}
          <AnalysisSection 
            isLoading={isLoading}
            error={error}
            comparisonResult={comparisonResult}
            laptopLeft={laptopLeft}
            laptopRight={laptopRight}
          />
          
          {/* Detailed Specs Comparison */}
          <SpecificationsSection comparisonSections={comparisonSections} />
        </div>
      </main>
    </div>
  );
};

export default ComparePage;
