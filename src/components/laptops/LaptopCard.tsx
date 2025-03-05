
import { Card } from "@/components/ui/card";
import type { Product } from "@/types/product";
import { LaptopImage } from "./components/LaptopImage";
import { LaptopPrice } from "./components/LaptopPrice";
import { LaptopRating } from "./components/LaptopRating";
import { LaptopSpecs } from "./components/LaptopSpecs";
import { LaptopReviews } from "./components/LaptopReviews";
import { LaptopCompareButton } from "./components/LaptopCompareButton";

type LaptopCardProps = {
  laptop: Product;
};

export function LaptopCard({ laptop }: LaptopCardProps) {
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
    ? `https://amazon.com/dp/${laptop.asin}?tag=with-laptop-discount-20`
    : '';
  
  // URLs for different purposes
  const productUrl = baseProductUrl;
  const reviewsUrl = laptop.asin && laptop.rating_count && laptop.rating_count > 0 
    ? `${baseProductUrl}#customerReviews` 
    : '';

  // Check if we have valid review data to display
  const hasReviews = laptop.review_data?.recent_reviews && 
                     laptop.review_data.recent_reviews.length > 0;

  return (
    <Card className="flex p-4 gap-4 hover:shadow-lg transition-shadow">
      {/* Left side - Image and Price */}
      <div className="flex flex-col items-center gap-2 w-40">
        <LaptopImage 
          title={laptop.title || 'Laptop'}
          imageUrl={laptop.image_url}
          productUrl={productUrl}
        />
        
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

      {/* Right side - Specs and Reviews */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
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
          
          <div className="ml-2 mt-1">
            <LaptopCompareButton laptop={laptop} />
          </div>
        </div>

        {/* Only show reviews section if we have actual review data */}
        {hasReviews && (
          <LaptopReviews 
            reviewData={laptop.review_data}
            productUrl={reviewsUrl}
          />
        )}
      </div>
    </Card>
  );
}
