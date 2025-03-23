
import React from "react";
import WinnerBadge from "./WinnerBadge";
import AdvantagesList from "./AdvantagesList";
import ValueForMoney from "./ValueForMoney";
import Recommendation from "./Recommendation";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "../../types";
import { formatLaptopDisplayTitle } from "../../utils/titleFormatter";

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
      {/* Winner Badge */}
      <div className="flex justify-center mb-6 h-14 items-center">
        <WinnerBadge 
          winner={comparisonResult.winner} 
          laptopLeft={laptopLeft} 
          laptopRight={laptopRight} 
        />
      </div>
      
      {/* Analysis Text */}
      <div className="text-base leading-relaxed">
        {renderAnalysisParagraphs(comparisonResult.analysis)}
      </div>
      
      {/* Advantages - With blue vs yellow theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <AdvantagesList
          laptopName={formatLaptopDisplayTitle(laptopLeft)}
          advantages={comparisonResult.advantages.left}
          colorTheme="blue"
        />
        
        <AdvantagesList
          laptopName={formatLaptopDisplayTitle(laptopRight)}
          advantages={comparisonResult.advantages.right}
          colorTheme="yellow"
        />
      </div>
      
      {/* Value for Money - With blue vs yellow theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ValueForMoney
          laptopName={formatLaptopDisplayTitle(laptopLeft)}
          valueAssessment={comparisonResult.valueForMoney.left}
          colorTheme="blue"
        />
        
        <ValueForMoney
          laptopName={formatLaptopDisplayTitle(laptopRight)}
          valueAssessment={comparisonResult.valueForMoney.right}
          colorTheme="yellow"
        />
      </div>
      
      {/* Recommendation */}
      <Recommendation recommendation={comparisonResult.recommendation} />
    </div>
  );
};

export default AnalysisContent;
