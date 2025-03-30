
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Zap } from 'lucide-react';

interface ProductActionsProps {
  productUrl?: string;
  searchQuery?: string;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ 
  productUrl,
  searchQuery
}) => {
  const handleViewOnAmazon = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col space-y-3">
      {productUrl ? (
        <Button 
          onClick={() => handleViewOnAmazon(productUrl)}
          className="w-full bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all"
        >
          Check It Out Now
          <Zap className="w-4 h-4 ml-2 animate-pulse" />
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full hover:border-blue-500 hover:text-blue-600 transform hover:-translate-y-0.5 transition-all"
          onClick={() => searchQuery && window.open(`https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`, '_blank')}
        >
          Search on Amazon
          <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Button>
      )}
    </div>
  );
};
