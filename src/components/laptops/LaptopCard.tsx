
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
  // Add more detailed console log for debugging price issues
  console.log('Rendering laptop:', {
    id: laptop.id,
    title: laptop.title,
    price: {
      current: laptop.current_price,
      original: laptop.original_price,
      type: typeof laptop.current_price,
      isValid: typeof laptop.current_price === 'number' && !isNaN(laptop.current_price)
    }
  });

  const productUrl = `https://amazon.co.uk/dp/${laptop.asin}?tag=with-laptop-discount-20`;

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

        {laptop.review_data && (
          <LaptopReviews reviewData={laptop.review_data} />
        )}
      </div>
    </Card>
  );
}
