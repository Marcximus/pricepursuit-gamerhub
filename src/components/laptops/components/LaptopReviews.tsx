
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LaptopRating } from "./LaptopRating";
import type { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";

type LaptopReviewsProps = {
  reviewData: NonNullable<Product["review_data"]>;
  productUrl: string;
};

type ReviewDialogProps = {
  review: {
    rating: number;
    title?: string;
    content?: string;
    reviewer_name?: string;
    review_date?: string;
    verified_purchase?: boolean;
    helpful_votes?: number;
  };
  isOpen: boolean;
  onClose: () => void;
};

const ReviewDialog = ({ review, isOpen, onClose }: ReviewDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{review.title || "Product Review"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <LaptopRating rating={review.rating} />
          <span className="text-gray-600 text-sm">
            {review.reviewer_name || 'Anonymous'}
            {review.verified_purchase && (
              <span className="text-green-600 ml-1">(Verified Purchase)</span>
            )}
          </span>
        </div>
        {review.review_date && (
          <p className="text-sm text-gray-500">
            Reviewed on {new Date(review.review_date).toLocaleDateString()}
          </p>
        )}
        <p className="text-gray-700">{review.content}</p>
        {review.helpful_votes !== undefined && review.helpful_votes > 0 && (
          <p className="text-sm text-gray-600">
            {review.helpful_votes} {review.helpful_votes === 1 ? 'person' : 'people'} found this helpful
          </p>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export function LaptopReviews({ reviewData, productUrl }: LaptopReviewsProps) {
  const [selectedReview, setSelectedReview] = useState<number | null>(null);

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
            <div key={index}>
              <a 
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left text-sm hover:bg-gray-50 p-2 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LaptopRating rating={review.rating} />
                    <span className="text-gray-600 text-xs">
                      {review.reviewer_name || 'Anonymous'}
                      {review.verified_purchase && (
                        <span className="text-green-600 ml-1">(Verified Purchase)</span>
                      )}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {review.title && (
                  <p className="font-medium mt-1">{review.title}</p>
                )}
                {review.content && (
                  <p className="text-gray-600 line-clamp-2 mt-1">{review.content}</p>
                )}
              </a>

              {selectedReview === index && (
                <ReviewDialog
                  review={review}
                  isOpen={true}
                  onClose={() => setSelectedReview(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
