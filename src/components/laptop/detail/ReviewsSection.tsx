import { Star, ThumbsUp, BadgeCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/product';

interface ReviewsSectionProps {
  product: Product;
}

export function ReviewsSection({ product }: ReviewsSectionProps) {
  const { review_data, rating, rating_count, wilson_score } = product;

  if (!rating || !rating_count) {
    return null;
  }

  const ratingBreakdown = review_data?.rating_breakdown || {};
  const recentReviews = review_data?.recent_reviews || [];

  // Calculate percentages for rating breakdown
  const totalReviews = rating_count;
  const ratingPercentages = {
    5: ((ratingBreakdown['5'] || 0) / totalReviews) * 100,
    4: ((ratingBreakdown['4'] || 0) / totalReviews) * 100,
    3: ((ratingBreakdown['3'] || 0) / totalReviews) * 100,
    2: ((ratingBreakdown['2'] || 0) / totalReviews) * 100,
    1: ((ratingBreakdown['1'] || 0) / totalReviews) * 100,
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
        }`}
      />
    ));
  };

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-foreground mb-6">Customer Reviews</h2>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Rating Overview */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-foreground mb-2">
              {rating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars(Math.round(rating))}
            </div>
            <p className="text-muted-foreground">
              Based on {rating_count.toLocaleString()} reviews
            </p>
            {wilson_score && (
              <Badge variant="secondary" className="mt-2">
                Wilson Score: {wilson_score.toFixed(2)}
              </Badge>
            )}
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-8">{star} ★</span>
                <Progress value={ratingPercentages[star as keyof typeof ratingPercentages]} className="flex-1" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {Math.round(ratingPercentages[star as keyof typeof ratingPercentages])}%
                </span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <a
              href={`https://www.amazon.com/dp/${product.asin}?tag=with-laptop-discount-20#customerReviews`}
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              Read all reviews on Amazon
            </a>
          </Button>
        </div>

        {/* Recent Reviews */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Recent Reviews</h3>
          
          {recentReviews.length > 0 ? (
            <div className="space-y-4">
              {recentReviews.slice(0, 5).map((review, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-6 space-y-3">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        {review.verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            <BadgeCheck className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-semibold text-foreground">{review.title}</h4>
                      )}
                    </div>
                    {review.review_date && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.review_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Reviewer */}
                  {review.reviewer_name && (
                    <p className="text-sm text-muted-foreground">
                      By {review.reviewer_name}
                    </p>
                  )}

                  {/* Review Content */}
                  {review.content && (
                    <p className="text-foreground">{review.content}</p>
                  )}

                  {/* Helpful Votes */}
                  {review.helpful_votes && review.helpful_votes > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{review.helpful_votes} people found this helpful</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                No detailed reviews available yet. Check Amazon for the latest reviews.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
