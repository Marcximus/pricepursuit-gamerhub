
import { LaptopRating } from "./LaptopRating";
import type { Product } from "@/types/product";

type LaptopReviewsProps = {
  reviewData: NonNullable<Product["review_data"]>;
};

export function LaptopReviews({ reviewData }: LaptopReviewsProps) {
  console.log('LaptopReviews received reviewData:', reviewData);

  if (!reviewData?.recent_reviews || reviewData.recent_reviews.length === 0) {
    console.log('No reviews to display');
    return null;
  }

  console.log(`Rendering ${reviewData.recent_reviews.length} reviews`);

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Recent Reviews</h4>
      <div className="space-y-2">
        {reviewData.recent_reviews.slice(0, 2).map((review, index) => {
          console.log(`Rendering review ${index}:`, review);
          return (
            <div key={index} className="text-sm">
              <div className="flex items-center gap-2">
                <LaptopRating rating={review.rating} />
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
          );
        })}
      </div>
    </div>
  );
}
