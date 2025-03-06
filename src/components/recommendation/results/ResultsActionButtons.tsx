
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Share2 } from 'lucide-react';
import { RecommendationResult } from '../types/quizTypes';
import { useComparison } from '@/contexts/ComparisonContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface ResultsActionButtonsProps {
  results: RecommendationResult[];
  onReset: () => void;
}

export const ResultsActionButtons: React.FC<ResultsActionButtonsProps> = ({
  results,
  onReset
}) => {
  const { addToComparison, clearComparison } = useComparison();
  const navigate = useNavigate();
  const canCompare = results.length >= 2 && results[0].product && results[1].product;
  
  const handleCompare = () => {
    if (!canCompare) {
      toast({
        title: "Can't compare",
        description: "Need two valid products to compare",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Clear any previous comparison
      clearComparison();
      
      // Convert recommendation products to global Product type and add to comparison
      let successfullyAdded = 0;
      
      for (let i = 0; i < 2; i++) {
        const recProduct = results[i].product;
        if (!recProduct) continue;
        
        const globalProduct = {
          id: recProduct.asin,
          title: recProduct.product_title,
          brand: recProduct.processor?.split(' ')[0] || 'Unknown',
          model: recProduct.product_title?.split(' ').slice(1, 3).join(' ') || 'Unknown Model',
          current_price: recProduct.product_price,
          original_price: recProduct.product_original_price,
          rating: recProduct.product_star_rating,
          rating_count: recProduct.product_num_ratings || 0,
          processor: recProduct.processor || 'Not specified',
          ram: recProduct.ram || 'Not specified',
          storage: recProduct.storage || 'Not specified',
          graphics: recProduct.graphics || 'Not specified',
          screen_size: recProduct.screen_size || 'Not specified',
          screen_resolution: recProduct.screen_resolution || 'Not specified',
          weight: recProduct.weight || 'Not specified',
          battery_life: recProduct.battery_life || 'Not specified',
          asin: recProduct.asin,
          image_url: recProduct.product_photo,
          product_url: recProduct.product_url || `https://amazon.com/dp/${recProduct.asin}?tag=with-laptop-discount-20`,
          last_checked: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        addToComparison(globalProduct);
        successfullyAdded++;
      }
      
      if (successfullyAdded === 2) {
        // Navigate to compare page using React Router
        navigate('/compare');
      } else {
        toast({
          title: "Error",
          description: "Could not add both products to comparison",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("Error setting up comparison:", error);
      toast({
        title: "Error",
        description: "Failed to set up comparison",
        variant: "destructive"
      });
    }
  };
  
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
          onClick={handleCompare}
          className="flex items-center"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compare These Laptops
        </Button>
      )}
    </div>
  );
};
