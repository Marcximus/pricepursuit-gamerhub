
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import type { Product } from "@/types/product";

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
  
  // Default image URL if none is provided
  const defaultImageUrl = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300";
  
  // Construct the referral link
  const getProductUrl = () => {
    if (!laptop.product_url) return '#';
    const url = new URL(laptop.product_url);
    url.searchParams.set('tag', 'with-laptop-discount-20');
    return url.toString();
  };

  const productUrl = getProductUrl();

  // Format price for display
  const formatPrice = (price: number | null) => {
    if (typeof price !== 'number' || isNaN(price)) return 'Price not available';
    return `£${price.toFixed(2)}`;
  };

  // Function to render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon 
            key={i} 
            className="h-4 w-4 fill-yellow-400 text-yellow-400" 
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-4 w-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-[50%]">
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarIcon 
            key={i} 
            className="h-4 w-4 text-gray-300" 
          />
        );
      }
    }
    return stars;
  };

  return (
    <Card className="flex p-4 gap-4 hover:shadow-lg transition-shadow">
      {/* Left side - Image and Price */}
      <div className="flex flex-col items-center gap-2 w-40">
        <a 
          href={productUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          <img
            src={laptop.image_url || defaultImageUrl}
            alt={laptop.title || 'Laptop image'}
            className="w-32 h-32 object-contain bg-gray-50"
            onError={(e) => {
              console.log('Image failed to load, using default image');
              const target = e.target as HTMLImageElement;
              target.src = defaultImageUrl;
            }}
          />
          <div className="text-xl font-bold text-center mt-2 text-blue-600 hover:text-blue-800">
            {formatPrice(laptop.current_price)}
          </div>
          {laptop.original_price && laptop.original_price > laptop.current_price && (
            <div className="text-sm text-gray-500 line-through text-center">
              {formatPrice(laptop.original_price)}
            </div>
          )}
        </a>

        {/* Rating section */}
        {laptop.average_rating && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex">
              {renderStarRating(laptop.average_rating)}
            </div>
            <span className="text-sm text-gray-600">
              {laptop.total_reviews 
                ? `${laptop.total_reviews.toLocaleString()} reviews`
                : ''}
            </span>
          </div>
        )}
      </div>

      {/* Right side - Specs */}
      <div className="flex-1">
        <a 
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-blue-600 transition-colors"
        >
          <h3 className="font-bold mb-2">{laptop.title || 'Untitled Laptop'}</h3>
        </a>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-bold">Screen:</span>{" "}
            {laptop.screen_size 
              ? `${laptop.screen_size} ${laptop.screen_resolution ? `(${laptop.screen_resolution})` : ''}`
              : 'Not specified'}
          </li>
          <li>
            <span className="font-bold">Processor:</span>{" "}
            {laptop.processor || 'Not specified'}
          </li>
          <li>
            <span className="font-bold">GPU:</span>{" "}
            {laptop.graphics || 'Not specified'}
          </li>
          <li>
            <span className="font-bold">RAM:</span>{" "}
            {laptop.ram || 'Not specified'}
          </li>
          <li>
            <span className="font-bold">Storage:</span>{" "}
            {laptop.storage || 'Not specified'}
          </li>
          {laptop.weight && (
            <li>
              <span className="font-bold">Weight:</span>{" "}
              {laptop.weight}
            </li>
          )}
          {laptop.battery_life && (
            <li>
              <span className="font-bold">Battery Life:</span>{" "}
              {laptop.battery_life}
            </li>
          )}
        </ul>

        {/* Recent Reviews Preview */}
        {laptop.review_data?.recent_reviews && laptop.review_data.recent_reviews.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Recent Reviews</h4>
            <div className="space-y-2">
              {laptop.review_data.recent_reviews.slice(0, 2).map((review, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-2">
                    {renderStarRating(review.rating)}
                    <span className="text-gray-600 text-xs">
                      {review.reviewer_name || 'Anonymous'}
                      {review.verified_purchase && (
                        <span className="text-green-600 ml-1">(Verified Purchase)</span>
                      )}
                    </span>
                  </div>
                  {review.title && (
                    <p className="font-medium">{review.title}</p>
                  )}
                  {review.content && (
                    <p className="text-gray-600 line-clamp-2">{review.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
