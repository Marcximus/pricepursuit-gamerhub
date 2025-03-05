
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

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
          className="w-full"
        >
          View on Amazon
          <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => searchQuery && window.open(`https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`, '_blank')}
        >
          Search on Amazon
          <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};
