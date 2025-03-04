
import React from "react";
import Navigation from "@/components/Navigation";
import { ComparisonHeader, LaptopCard, AnalysisSection, SpecificationsSection } from "./index";
import { formatPrice } from "../utils/comparisonHelpers";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "../types";
import type { ComparisonSection } from "../types";

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
  // Generate the comparison sections data
  const generateComparisonSections = (): ComparisonSection[] => {
    return [
      {
        title: 'Brand & Model',
        leftValue: `${laptopLeft?.brand || 'N/A'} ${laptopLeft?.model || ''}`,
        rightValue: `${laptopRight?.brand || 'N/A'} ${laptopRight?.model || ''}`,
      },
      {
        title: 'Processor',
        leftValue: laptopLeft?.processor || 'Not Specified',
        rightValue: laptopRight?.processor || 'Not Specified',
        compare: (a: string, b: string) => formatPrice(laptopLeft?.current_price) === a ? 'equal' : 'unknown'
      },
      {
        title: 'RAM',
        leftValue: laptopLeft?.ram || 'Not Specified',
        rightValue: laptopRight?.ram || 'Not Specified',
        compare: (a: string, b: string) => a === b ? 'equal' : a > b ? 'better' : 'worse'
      },
      {
        title: 'Storage',
        leftValue: laptopLeft?.storage || 'Not Specified',
        rightValue: laptopRight?.storage || 'Not Specified',
        compare: (a: string, b: string) => a === b ? 'equal' : a > b ? 'better' : 'worse'
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
        compare: (a: string, b: string) => a === b ? 'equal' : parseFloat(a.replace('$', '')) < parseFloat(b.replace('$', '')) ? 'better' : 'worse'
      },
      {
        title: 'Rating',
        leftValue: laptopLeft?.rating ? `${laptopLeft.rating}/5 (${laptopLeft.rating_count} reviews)` : 'No ratings',
        rightValue: laptopRight?.rating ? `${laptopRight.rating}/5 (${laptopRight.rating_count} reviews)` : 'No ratings',
        compare: (a: string, b: string) => {
          const aMatch = a.match(/(\d+\.\d+)\/5/);
          const bMatch = b.match(/(\d+\.\d+)\/5/);
          
          if (aMatch && bMatch) {
            const aRating = parseFloat(aMatch[1]);
            const bRating = parseFloat(bMatch[1]);
            
            if (aRating > bRating) return 'better';
            if (aRating < bRating) return 'worse';
            return 'equal';
          }
          
          return 'unknown';
        }
      },
    ];
  };
  
  const comparisonSections = generateComparisonSections();
  
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
