
import React from 'react';
import { RecommendationResult } from './types/quizTypes';
import { EmptyResults } from './results/EmptyResults';
import { ResultsHeader } from './results/ResultsHeader';
import { ResultsActionButtons } from './results/ResultsActionButtons';
import { RecommendationCard } from './results/RecommendationCard';
import { ConfettiEffect } from './results/components/ConfettiEffect';

interface RecommendationResultsProps {
  results: RecommendationResult[];
  onReset: () => void;
}

export const RecommendationResults: React.FC<RecommendationResultsProps> = ({ 
  results, 
  onReset 
}) => {
  if (!results || results.length === 0) {
    return <EmptyResults onReset={onReset} />;
  }

  // Sort results to ensure recommendation 1 is first and recommendation 2 is second
  const sortedResults = [...results].sort((a, b) => {
    // If we have exactly 2 results, make sure they're in the right order
    if (results.length === 2) {
      return 0; // Keep original order as our cards will be in a grid
    }
    return 0;
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Add ConfettiEffect when results are displayed */}
      <ConfettiEffect />
      
      <ResultsHeader />
      <ResultsActionButtons 
        results={sortedResults} 
        onReset={onReset} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {sortedResults.map((result, index) => (
          <RecommendationCard 
            key={index} 
            result={result} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
};
