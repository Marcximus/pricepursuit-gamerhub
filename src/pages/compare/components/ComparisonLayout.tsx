
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw, X } from "lucide-react";
import type { Product } from "@/types/product";
import ComparisonHeader from "./ComparisonHeader";
import LaptopCard from "./LaptopCard";
import SpecificationsSection from "./SpecificationsSection";
import EmptyComparisonState from "./EmptyComparisonState";
import AnalysisSection from "./AnalysisSection";
import type { ComparisonResult } from "./ComparisonDataProvider";

interface ComparisonLayoutProps {
  handleGoBack: () => void;
  handleClearAndGoBack: () => void;
  isLoading: boolean;
  error: string | null;
  comparisonResult: ComparisonResult | null;
  laptopLeft: Product | null;
  laptopRight: Product | null;
  hasSelectedLaptops: boolean;
  enhancedSpecsLeft: Record<string, any> | null;
  enhancedSpecsRight: Record<string, any> | null;
}

const ComparisonLayout: React.FC<ComparisonLayoutProps> = ({
  handleGoBack,
  handleClearAndGoBack,
  isLoading,
  error,
  comparisonResult,
  laptopLeft,
  laptopRight,
  hasSelectedLaptops,
  enhancedSpecsLeft,
  enhancedSpecsRight
}) => {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGoBack}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearAndGoBack}
          className="flex items-center gap-1"
        >
          <X className="w-4 h-4" /> Clear and Back
        </Button>
      </div>
      
      {!hasSelectedLaptops ? (
        <EmptyComparisonState />
      ) : (
        <>
          <ComparisonHeader 
            laptopLeft={laptopLeft} 
            laptopRight={laptopRight} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <LaptopCard 
              laptop={laptopLeft} 
              side="left" 
              winner={comparisonResult?.winner} 
            />
            <LaptopCard 
              laptop={laptopRight} 
              side="right" 
              winner={comparisonResult?.winner}
            />
          </div>
          
          <div className="space-y-6">
            <AnalysisSection 
              isLoading={isLoading}
              error={error}
              comparisonResult={comparisonResult}
            />
            
            <SpecificationsSection 
              laptopLeft={laptopLeft} 
              laptopRight={laptopRight}
              enhancedSpecsLeft={enhancedSpecsLeft}
              enhancedSpecsRight={enhancedSpecsRight}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonLayout;
