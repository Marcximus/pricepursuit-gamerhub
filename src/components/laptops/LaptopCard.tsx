
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
  // Add more detailed price logging
  console.log('Rendering laptop prices:', {
    id: laptop.id,
    asin: laptop.asin,
    currentPrice: laptop.current_price,
    originalPrice: laptop.original_price,
    lastChecked: laptop.last_checked,
    updateStatus: laptop.update_status,
  });

  if (!laptop.asin) {
    console.error('Missing ASIN for laptop:', laptop.title);
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
            weight: laptop.weight,
            batteryLife: laptop.battery_life
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
