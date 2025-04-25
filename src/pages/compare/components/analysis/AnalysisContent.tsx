import React from "react";
import WinnerBadge from "./WinnerBadge";
import AdvantagesList from "./AdvantagesList";
import ValueForMoney from "./ValueForMoney";
import Recommendation from "./Recommendation";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "../../types";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnalysisContentProps {
  comparisonResult: ComparisonResult;
  laptopLeft: Product;
  laptopRight: Product;
}

const AnalysisContent: React.FC<AnalysisContentProps> = ({
  comparisonResult,
  laptopLeft,
  laptopRight
}) => {
  const isMobile = useIsMobile();
  
  // Function to render paragraphs with proper spacing
  const renderAnalysisParagraphs = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-4' : ''}>
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-center mb-6 h-14 items-center">
        <WinnerBadge 
          winner={comparisonResult.winner} 
          laptopLeft={laptopLeft} 
          laptopRight={laptopRight} 
        />
      </div>
      
      <div className="text-base leading-relaxed">
        {renderAnalysisParagraphs(comparisonResult.analysis)}
      </div>
      
      {/* Adjusted grid for mobile */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 sm:gap-6 mt-6`}>
        <AdvantagesList
          laptopName={`${laptopLeft?.brand} ${laptopLeft?.model}`}
          advantages={comparisonResult.advantages.left}
          colorTheme="blue"
        />
        
        <AdvantagesList
          laptopName={`${laptopRight?.brand} ${laptopRight?.model}`}
          advantages={comparisonResult.advantages.right}
          colorTheme="yellow"
        />
      </div>
      
      {/* Adjusted grid for mobile */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 sm:gap-6 mt-6`}>
        <ValueForMoney
          laptopName={`${laptopLeft?.brand} ${laptopLeft?.model}`}
          valueAssessment={comparisonResult.valueForMoney.left}
          colorTheme="blue"
        />
        
        <ValueForMoney
          laptopName={`${laptopRight?.brand} ${laptopRight?.model}`}
          valueAssessment={comparisonResult.valueForMoney.right}
          colorTheme="yellow"
        />
      </div>
      
      <Recommendation recommendation={comparisonResult.recommendation} />
    </div>
  );
};

export default AnalysisContent;
