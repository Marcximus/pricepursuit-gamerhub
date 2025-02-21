
import { Card } from "@/components/ui/card";
import type { Product } from "@/types/product";
import { LaptopImage } from "./components/LaptopImage";
import { LaptopPrice } from "./components/LaptopPrice";
import { LaptopRating } from "./components/LaptopRating";
import { LaptopSpecs } from "./components/LaptopSpecs";
import { LaptopReviews } from "./components/LaptopReviews";

type LaptopCardProps = {
  laptop: Product;
};

export function LaptopCard({ laptop }: LaptopCardProps) {
  // Add detailed logging for debugging
  console.log('Rendering laptop:', {
    id: laptop.id,
    title: laptop.title,
    asin: laptop.asin,
    currentPrice: laptop.current_price,
    originalPrice: laptop.original_price,
    lastChecked: laptop.last_checked,
    updateStatus: laptop.update_status,
    specs: {
      processor: laptop.processor,
      ram: laptop.ram,
      storage: laptop.storage,
      graphics: laptop.graphics,
      screenSize: laptop.screen_size,
    }
  });

  // Input validation
  if (!laptop.asin || !laptop.title) {
    console.error('Invalid laptop data:', laptop);
    return null;
  }

  // Base product URL with affiliate tag
  const baseProductUrl = `https://amazon.com/dp/${laptop.asin}?tag=with-laptop-discount-20`;
  
  // URLs for different purposes
  const productUrl = baseProductUrl;
  const reviewsUrl = `${baseProductUrl}#customerReviews`;

  return (
    <Card className="flex p-4 gap-4 hover:shadow-lg transition-shadow">
      {/* Left side - Image and Price */}
      <div className="flex flex-col items-center gap-2 w-40">
        <LaptopImage 
          title={laptop.title}
          imageUrl={laptop.image_url}
          productUrl={productUrl}
        />
        
        <LaptopPrice 
          currentPrice={laptop.current_price}
          originalPrice={laptop.original_price}
          productUrl={productUrl}
        />

        {laptop.average_rating && (
          <LaptopRating 
            rating={laptop.average_rating}
            totalReviews={laptop.total_reviews}
            reviewsUrl={reviewsUrl}
          />
        )}
      </div>

      {/* Right side - Specs and Reviews */}
      <div className="flex-1">
        <LaptopSpecs 
          title={laptop.title}
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
        />

        {laptop.review_data && laptop.review_data.recent_reviews && laptop.review_data.recent_reviews.length > 0 && (
          <LaptopReviews 
            reviewData={laptop.review_data}
            productUrl={reviewsUrl}
          />
        )}
      </div>
    </Card>
  );
}
