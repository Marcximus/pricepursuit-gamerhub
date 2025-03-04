
import React from "react";
import WinnerBadge from "./WinnerBadge";
import AdvantagesList from "./AdvantagesList";
import ValueForMoney from "./ValueForMoney";
import Recommendation from "./Recommendation";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "../../types";

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
        <p>{comparisonResult.analysis}</p>
      </div>
      
      {/* Advantages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <AdvantagesList
          laptopName={`${laptopLeft?.brand} ${laptopLeft?.model}`}
          advantages={comparisonResult.advantages.left}
        />
        
        <AdvantagesList
          laptopName={`${laptopRight?.brand} ${laptopRight?.model}`}
          advantages={comparisonResult.advantages.right}
        />
      </div>
      
      {/* Value for Money */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ValueForMoney
          laptopName={`${laptopLeft?.brand} ${laptopLeft?.model}`}
          valueAssessment={comparisonResult.valueForMoney.left}
        />
        
        <ValueForMoney
          laptopName={`${laptopRight?.brand} ${laptopRight?.model}`}
          valueAssessment={comparisonResult.valueForMoney.right}
        />
      </div>
      
      {/* Recommendation */}
      <Recommendation recommendation={comparisonResult.recommendation} />
    </div>
  );
};

export default AnalysisContent;
