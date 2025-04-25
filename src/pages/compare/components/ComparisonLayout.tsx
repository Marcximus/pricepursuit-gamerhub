import React from "react";
import Navigation from "@/components/Navigation";
import { ComparisonHeader, LaptopCard, AnalysisSection, SpecificationsSection } from "./index";
import { formatPrice } from "../utils/comparisonHelpers";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "../types";
import type { ComparisonSection } from "../types";
import EmptyComparisonState from "./EmptyComparisonState";
import { formatLaptopDisplayTitle } from "../utils/titleFormatter";
import { useIsMobile } from "@/hooks/useIsMobile";

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
  const generateComparisonSections = (): ComparisonSection[] => {
    if (!laptopLeft || !laptopRight) return [];
    return [
      {
        title: 'Brand & Model',
        leftValue: formatLaptopDisplayTitle(laptopLeft),
        rightValue: formatLaptopDisplayTitle(laptopRight)
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
        rightValue: laptopRight?.graphics || 'Not Specified'
      },
      {
        title: 'Display',
        leftValue: `${laptopLeft?.screen_size || 'N/A'} ${laptopLeft?.screen_resolution ? `(${laptopLeft.screen_resolution})` : ''}`,
        rightValue: `${laptopRight?.screen_size || 'N/A'} ${laptopRight?.screen_resolution ? `(${laptopRight.screen_resolution})` : ''}`
      },
      {
        title: 'Price',
        leftValue: formatPrice(laptopLeft?.current_price),
        rightValue: formatPrice(laptopRight?.current_price),
        compare: (a: string, b: string) => {
          const aPrice = parseFloat(a.replace('$ ', '').replace(/,/g, ''));
          const bPrice = parseFloat(b.replace('$ ', '').replace(/,/g, ''));
          return aPrice === bPrice ? 'equal' : aPrice < bPrice ? 'better' : 'worse';
        }
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
      }
    ];
  };

  const comparisonSections = generateComparisonSections();
  const isMobile = useIsMobile();

  return <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ComparisonHeader handleGoBack={handleGoBack} handleClearAndGoBack={handleClearAndGoBack} />
          
          <h1 className="text-2xl font-bold mb-6">Best Laptop Comparison</h1>
          
          {!hasSelectedLaptops ? <EmptyComparisonState /> : <>
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 sm:gap-8 mb-8`}>
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
              
              <AnalysisSection 
                isLoading={isLoading} 
                error={error} 
                comparisonResult={comparisonResult} 
                laptopLeft={laptopLeft} 
                laptopRight={laptopRight} 
              />
              
              {comparisonResult && laptopLeft && laptopRight && (
                <SpecificationsSection 
                  laptopLeft={laptopLeft} 
                  laptopRight={laptopRight} 
                  comparisonResult={comparisonResult} 
                />
              )}
            </>}
        </div>
      </main>
    </div>;
};

export default ComparisonLayout;
