
import React from "react";
import { Card } from "@/components/ui/card";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "../../types";
import { BookOpen } from "lucide-react";
import AnalysisContent from "./AnalysisContent";

interface AnalysisSectionProps {
  laptopLeft: Product | null;
  laptopRight: Product | null;
  comparisonResult: ComparisonResult;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  laptopLeft,
  laptopRight,
  comparisonResult
}) => {
  if (!laptopLeft || !laptopRight) return null;
  
  return (
    <Card className="mb-8 overflow-hidden">
      <div className="bg-primary/10 p-4 flex items-center justify-center gap-3">
        <span className="text-xl" aria-label="Test Tube">🧪</span>
        <h2 className="text-lg font-semibold">AI Analysis</h2>
        <span className="text-xl" aria-label="DNA">🧬</span>
      </div>
      
      <div className="p-6">
        <AnalysisContent 
          comparisonResult={comparisonResult}
          laptopLeft={laptopLeft}
          laptopRight={laptopRight}
        />
      </div>
    </Card>
  );
};

export default AnalysisSection;
