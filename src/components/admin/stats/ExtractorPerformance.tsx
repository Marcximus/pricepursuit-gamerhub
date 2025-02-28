
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ExtractionRate {
  field: string;
  successRate: number;
  successCount: number;
  totalCount: number;
}

interface ExtractorPerformanceProps {
  rates: ExtractionRate[];
}

export function ExtractorPerformance({ rates }: ExtractorPerformanceProps) {
  // Sort rates by success rate (ascending)
  const sortedRates = [...rates].sort((a, b) => a.successRate - b.successRate);
  
  const getStatusColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 70) return "bg-yellow-500";
    if (rate >= 50) return "bg-orange-500";
    return "bg-red-500";
  };
  
  const getStatusLabel = (rate: number) => {
    if (rate >= 90) return "Excellent";
    if (rate >= 70) return "Good";
    if (rate >= 50) return "Fair";
    return "Poor";
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Extraction Performance</CardTitle>
        <CardDescription>
          Success rates for specification extraction from product data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRates.map((rate) => (
            <div key={rate.field} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium capitalize">
                  {rate.field.replace('_', ' ')}
                </span>
                <span className="text-sm">
                  {rate.successRate}% ({rate.successCount}/{rate.totalCount})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={rate.successRate} 
                  className="h-2"
                  indicatorClassName={getStatusColor(rate.successRate)}
                />
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  rate.successRate >= 90 ? "bg-green-100 text-green-800" :
                  rate.successRate >= 70 ? "bg-yellow-100 text-yellow-800" :
                  rate.successRate >= 50 ? "bg-orange-100 text-orange-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {getStatusLabel(rate.successRate)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {sortedRates.some(rate => rate.successRate < 70) && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <h4 className="text-sm font-medium text-amber-800 mb-1">Improvement Needed</h4>
            <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4">
              {sortedRates
                .filter(rate => rate.successRate < 70)
                .map(rate => (
                  <li key={`fix-${rate.field}`}>
                    The {rate.field.replace('_', ' ')} extractor needs optimization
                    ({rate.successRate}% success rate)
                  </li>
                ))
              }
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ExtractorPerformance;
