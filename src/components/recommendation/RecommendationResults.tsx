
import React from 'react';
import { useComparison } from '@/contexts/ComparisonContext';
import { RecommendationResult } from './types/quizTypes';
import { EmptyResults } from './results/EmptyResults';
import { ResultsHeader } from './results/ResultsHeader';
import { ResultsActionButtons } from './results/ResultsActionButtons';
import { RecommendationCard } from './results/RecommendationCard';
import type { Product as GlobalProduct } from '@/types/product'; // Import the global Product type

interface RecommendationResultsProps {
  results: RecommendationResult[];
  onReset: () => void;
}

export const RecommendationResults: React.FC<RecommendationResultsProps> = ({ 
  results, 
  onReset 
}) => {
  // Use the ComparisonContext
  const { addToComparison, clearComparison } = useComparison();

  const handleCompare = () => {
    if (results && results.length >= 2 && results[0].product && results[1].product) {
      // Clear any previous comparison selections
      clearComparison();
      
      // Convert recommendation Product to the global Product type
      const convertToGlobalProduct = (recProduct: RecommendationResult['product']): GlobalProduct => {
        if (!recProduct) throw new Error("Product is undefined");
        
        return {
          id: recProduct.asin, // Use ASIN as ID
          title: recProduct.product_title,
          brand: recProduct.processor?.split(' ')[0] || 'Unknown', // Extract brand from processor or use unknown
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
      };
      
      try {
        // Add both products to comparison
        const product1 = convertToGlobalProduct(results[0].product);
        const product2 = convertToGlobalProduct(results[1].product);
        
        addToComparison(product1);
        addToComparison(product2);
        
        // Navigate to compare page
        window.open('/compare', '_blank');
      } catch (error) {
        console.error("Error setting up comparison:", error);
      }
    }
  };

  if (!results || results.length === 0) {
    return <EmptyResults onReset={onReset} />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ResultsHeader />
      <ResultsActionButtons 
        results={results} 
        onReset={onReset} 
        onCompare={handleCompare} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
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
