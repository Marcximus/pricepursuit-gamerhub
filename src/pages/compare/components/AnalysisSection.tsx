
import React from "react";
import { Award, Check, CircleX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/product";

interface ComparisonResult {
  winner: 'left' | 'right' | 'tie';
  analysis: string;
  advantages: {
    left: string[];
    right: string[];
  };
  recommendation: string;
  valueForMoney: {
    left: string;
    right: string;
  };
}

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
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <CircleX className="w-12 h-12 text-destructive mx-auto mb-2" />
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : comparisonResult ? (
          <div className="space-y-6">
            {/* Winner Badge */}
            <div className="flex justify-center mb-6">
              {comparisonResult.winner !== 'tie' && (
                <Badge variant="default" className="text-lg px-4 py-2 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Winner: {comparisonResult.winner === 'left' 
                    ? laptopLeft?.brand + ' ' + (laptopLeft?.model || '')
                    : laptopRight?.brand + ' ' + (laptopRight?.model || '')}
                </Badge>
              )}
              
              {comparisonResult.winner === 'tie' && (
                <Badge variant="outline" className="text-lg px-4 py-2">
                  It's a tie! Both laptops have their strengths.
                </Badge>
              )}
            </div>
            
            {/* Analysis Text */}
            <div className="text-base leading-relaxed">
              <p>{comparisonResult.analysis}</p>
            </div>
            
            {/* Advantages */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold mb-3">
                  {laptopLeft?.brand} {laptopLeft?.model} Advantages
                </h3>
                <ul className="space-y-2">
                  {comparisonResult.advantages.left.map((advantage, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">
                  {laptopRight?.brand} {laptopRight?.model} Advantages
                </h3>
                <ul className="space-y-2">
                  {comparisonResult.advantages.right.map((advantage, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Value for Money */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold mb-2">Value for Money</h3>
                <p>{comparisonResult.valueForMoney.left}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Value for Money</h3>
                <p>{comparisonResult.valueForMoney.right}</p>
              </div>
            </div>
            
            {/* Recommendation */}
            <div className="bg-slate-50 p-4 rounded-md mt-6">
              <h3 className="font-semibold mb-2">Recommendation</h3>
              <p>{comparisonResult.recommendation}</p>
            </div>
          </div>
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
