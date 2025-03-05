
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyResultsProps {
  onReset: () => void;
}

export const EmptyResults: React.FC<EmptyResultsProps> = ({ onReset }) => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">No recommendations found</h2>
      <p className="text-gray-600 mb-6">We couldn't find any recommendations for your criteria.</p>
      <Button onClick={onReset}>Try Again</Button>
    </div>
  );
};
