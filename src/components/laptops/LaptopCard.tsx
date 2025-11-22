import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Product } from "@/types/product";
import { LaptopImage } from "./components/LaptopImage";
import { LaptopPrice } from "./components/LaptopPrice";
import { LaptopRating } from "./components/LaptopRating";
import { LaptopSpecs } from "./components/LaptopSpecs";
import { LaptopReviews } from "./components/LaptopReviews";
import { LaptopCompareButton } from "./components/LaptopCompareButton";
import { Zap, Info } from "lucide-react";

type LaptopCardProps = {
  laptop: Product;
};

export function LaptopCard({ laptop }: LaptopCardProps) {
  const isMobile = useIsMobile();

  // Validate required fields
  if (!laptop || !laptop.id) {
    // If laptop has no ID but has an ASIN, use the ASIN as the ID
    if (laptop.asin && !laptop.id) {
      laptop = { ...laptop, id: laptop.asin };
    } else {
      console.error('Invalid laptop data received:', laptop);
      return null;
    }
  }

  // Base product URL with affiliate tag
  const baseProductUrl = laptop.asin 
    ? `https://www.amazon.com/dp/${laptop.asin}?tag=with-laptop-discount-20`
    : '';
  
  // URLs for different purposes
  const productUrl = baseProductUrl;
  const reviewsUrl = laptop.asin && laptop.rating_count && laptop.rating_count > 0 
    ? `${baseProductUrl}#customerReviews` 
    : '';

  // Check if we have valid review data to display
  const hasReviews = laptop.review_data?.recent_reviews && 
                     laptop.review_data.recent_reviews.length > 0;

  const handleCheckItOut = () => {
    if (productUrl) {
      window.open(productUrl, '_blank');
    }
  };

  return (
    <Card className={`flex ${isMobile ? 'flex-col' : 'flex-row'} p-3 lg:p-4 gap-3 lg:gap-4 hover:shadow-lg transition-shadow touch-manipulation`}>
      {/* Left side - Image and Price */}
      <div className={`flex ${isMobile ? 'flex-row justify-between' : 'flex-col'} items-center gap-2 ${isMobile ? 'w-full' : 'w-40'}`}>
        <div className={`${isMobile ? 'flex-shrink-0' : ''}`}>
          <LaptopImage 
            title={laptop.title || 'Laptop'}
            imageUrl={laptop.image_url}
            productUrl={productUrl}
          />
        </div>
        
        <div className={`flex ${isMobile ? 'flex-col items-end' : 'flex-col items-center'} gap-2 ${isMobile ? 'flex-shrink-0' : ''}`}>
          <LaptopPrice 
            currentPrice={laptop.current_price}
            originalPrice={laptop.original_price}
            productUrl={productUrl}
          />

          {laptop.rating && laptop.rating > 0 && (
            <LaptopRating 
              rating={laptop.rating}
              totalReviews={laptop.rating_count}
              reviewsUrl={reviewsUrl}
            />
          )}
        </div>
      </div>

      {/* Right side - Specs and Reviews */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-2 lg:gap-3">
          <LaptopSpecs 
            title={laptop.title || 'Untitled Laptop'}
            productUrl={productUrl}
            specs={{
              screenSize: laptop.screen_size,
              screenResolution: laptop.screen_resolution,
              processor: laptop.processor,
              graphics: laptop.graphics,
              ram: laptop.ram,
              storage: laptop.storage,
              weight: laptop.weight
            }}
            brand={laptop.brand}
            model={laptop.model}
          />
          
          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row gap-2'} mt-2`}>
            <Button
              onClick={handleCheckItOut}
              className="bg-green-600 hover:bg-green-700 transform hover:-translate-y-0.5 transition-all w-full sm:w-auto min-h-[44px] touch-manipulation"
            >
              <span className="truncate">Check it out</span>
              <Zap className="w-4 h-4 ml-2 animate-pulse flex-shrink-0" />
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto min-h-[44px] touch-manipulation"
              onClick={() => {}}
            >
              <Info className="w-4 h-4 mr-2" />
              <span className="truncate">Details</span>
            </Button>
            <LaptopCompareButton laptop={laptop} />
          </div>
        </div>

        {/* Only show reviews section if we have actual review data */}
        {laptop.review_data?.recent_reviews && laptop.review_data.recent_reviews.length > 0 && (
          <div className="mt-3 lg:mt-4">
            <LaptopReviews 
              reviewData={laptop.review_data}
              productUrl={reviewsUrl}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
