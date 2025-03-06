
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Share2 } from 'lucide-react';
import { RecommendationResult } from '../types/quizTypes';

interface ResultsActionButtonsProps {
  results: RecommendationResult[];
  onReset: () => void;
  onCompare: () => void;
}

export const ResultsActionButtons: React.FC<ResultsActionButtonsProps> = ({
  results,
  onReset,
  onCompare
}) => {
  const canCompare = results.length >= 2 && results[0].product && results[1].product;
  
  return (
    <div className="flex justify-center mb-10 mt-6 space-x-4">
      <Button 
        variant="outline" 
        onClick={onReset}
        className="flex items-center"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Start Over
      </Button>

      {canCompare && (
        <Button 
          onClick={onCompare}
          className="flex items-center"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compare These Laptops
        </Button>
      )}
    </div>
  );
};
