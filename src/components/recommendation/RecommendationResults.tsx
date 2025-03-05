
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, RefreshCw, ArrowUpRight, Check, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RecommendationResult {
  recommendation: {
    model: string;
    searchQuery: string;
    priceRange: {
      min: number;
      max: number;
    };
    reason: string;
  };
  product: {
    asin: string;
    product_title: string;
    product_price: string;
    product_original_price: string;
    currency: string;
    product_star_rating: string;
    product_num_ratings: number;
    product_url: string;
    product_photo: string;
    is_prime: boolean;
    delivery: string;
  } | null;
}

interface RecommendationResultsProps {
  results: RecommendationResult[];
  onReset: () => void;
}

export const RecommendationResults: React.FC<RecommendationResultsProps> = ({ 
  results, 
  onReset 
}) => {
  const [comparisonUrl, setComparisonUrl] = React.useState<string | null>(null);

  const handleViewOnAmazon = (url: string) => {
    window.open(url, '_blank');
  };

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
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No recommendations found</h2>
        <p className="text-gray-600 mb-6">We couldn't find any recommendations for your criteria.</p>
        <Button onClick={onReset}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">Your Personalized Recommendations</h1>
      <p className="text-center text-gray-600 mb-8">
        Based on your preferences, here are the best laptops for you
      </p>

      <div className="flex justify-center mb-6 space-x-4">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Start Over
        </Button>

        {results.length >= 2 && results[0].product && results[1].product && (
          <Button 
            onClick={handleCompare}
            className="flex items-center"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compare These Laptops
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {results.map((result, index) => (
          <Card key={index} className="overflow-hidden border-0 shadow-lg">
            <div className="relative">
              <div className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-1 rounded-br-md">
                Recommendation {index + 1}
              </div>
              
              {result.product ? (
                <div className="h-64 bg-gray-100 flex items-center justify-center p-6">
                  <img 
                    src={result.product.product_photo} 
                    alt={result.product.product_title} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-64 bg-gray-100 flex items-center justify-center p-6">
                  <div className="text-gray-400 text-center">
                    <p className="font-semibold mb-2">Image not available</p>
                    <p className="text-sm">{result.recommendation.model}</p>
                  </div>
                </div>
              )}
            </div>
            
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-2 line-clamp-2">
                {result.product ? result.product.product_title : result.recommendation.model}
              </h2>
              
              {result.product && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-amber-500">
                    <Star className="fill-current w-4 h-4" />
                    <span className="ml-1 font-medium">{result.product.product_star_rating}</span>
                  </div>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-gray-600 text-sm">{result.product.product_num_ratings.toLocaleString()} ratings</span>
                  
                  {result.product.is_prime && (
                    <>
                      <span className="mx-2 text-gray-400">|</span>
                      <span className="text-blue-600 text-sm font-medium">Prime</span>
                    </>
                  )}
                </div>
              )}
              
              <div className="mb-4">
                <div className="text-2xl font-bold text-blue-700">
                  {result.product ? result.product.product_price : `$${result.recommendation.priceRange.min} - $${result.recommendation.priceRange.max}`}
                </div>
                
                {result.product && result.product.product_original_price && (
                  <div className="text-sm text-gray-500">
                    <span className="line-through">{result.product.product_original_price}</span>
                    {' '}
                    <span className="text-green-600 font-medium">
                      {calculateDiscount(result.product.product_price, result.product.product_original_price)}% off
                    </span>
                  </div>
                )}
                
                {result.product && result.product.delivery && (
                  <div className="text-sm text-gray-600 mt-1">
                    {result.product.delivery}
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Why we recommend this:</h3>
                <p className="text-gray-600 text-sm">{result.recommendation.reason}</p>
              </div>
              
              <div className="flex flex-col space-y-3">
                {result.product && (
                  <Button 
                    onClick={() => handleViewOnAmazon(result.product!.product_url)}
                    className="w-full"
                  >
                    View on Amazon
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                
                {!result.product && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`https://www.amazon.com/s?k=${encodeURIComponent(result.recommendation.searchQuery)}`, '_blank')}
                  >
                    Search on Amazon
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Helper function to calculate discount percentage
function calculateDiscount(currentPrice: string, originalPrice: string): number {
  const current = parseFloat(currentPrice.replace(/[^0-9.]/g, ''));
  const original = parseFloat(originalPrice.replace(/[^0-9.]/g, ''));
  
  if (isNaN(current) || isNaN(original) || original <= 0) {
    return 0;
  }
  
  const discount = ((original - current) / original) * 100;
  return Math.round(discount);
}
