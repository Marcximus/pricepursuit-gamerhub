
import { StarIcon } from "lucide-react";

type LaptopRatingProps = {
  rating: number;
  totalReviews?: number;
};

export function LaptopRating({ rating, totalReviews }: LaptopRatingProps) {
  if (!rating) {
    return null;
  }

  console.log('Rendering rating:', { rating, totalReviews });

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
    <div className="flex flex-col items-center gap-1">
      <div className="flex">
        {renderStarRating(rating)}
      </div>
      {totalReviews && totalReviews > 0 && (
        <span className="text-sm text-gray-600">
          {totalReviews.toLocaleString()} reviews
        </span>
      )}
    </div>
  );
}
