
import React from "react";
import Navigation from "@/components/Navigation";
import { ComparisonHeader, LaptopCard, AnalysisSection, SpecificationsSection } from "./index";
import { formatPrice } from "../utils/comparisonHelpers";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "./ComparisonDataProvider";
import ComparisonSections from "./ComparisonSections";

interface ComparisonLayoutProps {
  handleGoBack: () => void;
  handleClearAndGoBack: () => void;
  isLoading: boolean;
  error: string | null;
  comparisonResult: ComparisonResult | null;
  laptopLeft: Product;
  laptopRight: Product;
}

const ComparisonLayout: React.FC<ComparisonLayoutProps> = ({
  handleGoBack,
  handleClearAndGoBack,
  isLoading,
  error,
  comparisonResult,
  laptopLeft,
  laptopRight
}) => {
  const comparisonSections = ComparisonSections({ laptopLeft, laptopRight });
  
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

export default ComparisonLayout;
