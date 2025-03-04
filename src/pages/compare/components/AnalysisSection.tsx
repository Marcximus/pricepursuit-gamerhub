
import React from "react";
import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import LoadingState from "./analysis/LoadingState";
import ErrorState from "./analysis/ErrorState";
import AnalysisContent from "./analysis/AnalysisContent";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "../types";

interface AnalysisSectionProps {
  isLoading: boolean;
  error: string | null;
  comparisonResult: ComparisonResult | null;
  laptopLeft: Product;
  laptopRight: Product;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  isLoading,
  error,
  comparisonResult,
  laptopLeft,
  laptopRight
}) => {
  return (
    <Card className="mb-8 overflow-hidden">
      <div className="bg-primary/10 p-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">AI Analysis</h2>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : comparisonResult ? (
          <AnalysisContent 
            comparisonResult={comparisonResult}
            laptopLeft={laptopLeft}
            laptopRight={laptopRight}
          />
        ) : (
          <div className="text-center p-4">
            <p className="text-muted-foreground">Analyzing laptops...</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AnalysisSection;
