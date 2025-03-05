
import React from 'react';
import { RecommendationResult } from './types/quizTypes';
import { EmptyResults } from './results/EmptyResults';
import { ResultsHeader } from './results/ResultsHeader';
import { ResultsActionButtons } from './results/ResultsActionButtons';
import { RecommendationCard } from './results/RecommendationCard';

interface RecommendationResultsProps {
  results: RecommendationResult[];
  onReset: () => void;
}

export const RecommendationResults: React.FC<RecommendationResultsProps> = ({ 
  results, 
  onReset 
}) => {
  const [comparisonUrl, setComparisonUrl] = React.useState<string | null>(null);

  const handleCompare = () => {
    if (results && results.length >= 2 && results[0].product && results[1].product) {
      const laptop1Id = results[0].product.asin;
      const laptop2Id = results[1].product.asin;
      const url = `/compare?left=${laptop1Id}&right=${laptop2Id}`;
      setComparisonUrl(url);
      window.open(url, '_blank');
    }
  };

  if (!results || results.length === 0) {
    return <EmptyResults onReset={onReset} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ResultsHeader />
      <ResultsActionButtons 
        results={results} 
        onReset={onReset} 
        onCompare={handleCompare} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {results.map((result, index) => (
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
