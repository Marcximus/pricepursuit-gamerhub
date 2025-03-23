
import React from "react";
import { ArrowLeft, Loader2, ListX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AnalysisSection from "./analysis/AnalysisSection";
import LaptopComparisonHeader from "./LaptopComparisonHeader";
import SpecificationsSection from "./SpecificationsSection";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "./ComparisonDataProvider";
import ComparisonSkeleton from "./skeletons/ComparisonSkeleton";
import NoLaptopsSelected from "./errors/NoLaptopsSelected";

interface ComparisonLayoutProps {
  handleGoBack: () => void;
  handleClearAndGoBack: () => void;
  isLoading: boolean;
  error: string | null;
  comparisonResult: ComparisonResult | null;
  laptopLeft: Product | null;
  laptopRight: Product | null;
  hasSelectedLaptops: boolean;
}

const ComparisonLayout: React.FC<ComparisonLayoutProps> = ({
  handleGoBack,
  handleClearAndGoBack,
  isLoading,
  error,
  comparisonResult,
  laptopLeft,
  laptopRight,
  hasSelectedLaptops
}) => {
  // If no laptops selected, show message
  if (!hasSelectedLaptops) {
    return <NoLaptopsSelected handleGoBack={handleGoBack} />;
  }
  
  return (
    <div className="container px-4 py-8">
      {/* Action buttons at top */}
      <div className="flex justify-between mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Button>
        
        <Button variant="ghost" onClick={handleClearAndGoBack} className="flex items-center gap-1">
          <ListX className="h-4 w-4" />
          Clear & Start Over
        </Button>
      </div>
      
      {/* Loading or error states */}
      {isLoading ? (
        <ComparisonSkeleton />
      ) : error ? (
        <Alert variant="destructive" className="my-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        // Main content when data is loaded
        <>
          {/* Laptop comparison header */}
          <LaptopComparisonHeader 
            laptopLeft={laptopLeft} 
            laptopRight={laptopRight} 
          />
          
          <div className="grid grid-cols-1 gap-8 mt-8">
            {/* Analysis section with winner and advantages */}
            {comparisonResult && (
              <AnalysisSection 
                laptopLeft={laptopLeft} 
                laptopRight={laptopRight} 
                comparisonResult={comparisonResult} 
              />
            )}
            
            {/* Specifications comparison section */}
            {comparisonResult && (
              <SpecificationsSection 
                laptopLeft={laptopLeft} 
                laptopRight={laptopRight}
                comparisonResult={comparisonResult}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonLayout;
