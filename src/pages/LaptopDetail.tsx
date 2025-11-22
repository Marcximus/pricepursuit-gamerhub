import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMockLaptopDetail } from '@/data/mockLaptopDetail';
import { LaptopDetailSEO } from '@/components/laptop/detail/LaptopDetailSEO';
import { HeroSection } from '@/components/laptop/detail/HeroSection';
import { DetailedSpecs } from '@/components/laptop/detail/DetailedSpecs';
import { PriceHistoryChart } from '@/components/laptop/detail/PriceHistoryChart';
import { ReviewsSection } from '@/components/laptop/detail/ReviewsSection';
import { SimilarLaptops } from '@/components/laptop/detail/SimilarLaptops';
import { LaptopFAQ } from '@/components/laptop/detail/LaptopFAQ';

export default function LaptopDetail() {
  const { asin } = useParams<{ asin: string }>();
  const navigate = useNavigate();
  
  // Use mock data for now
  const product = asin ? getMockLaptopDetail(asin) : null;

  if (!product || !asin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
          <p className="text-muted-foreground">
            We couldn't find the laptop you're looking for.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Laptops
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LaptopDetailSEO product={product} />
      
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Laptops
        </Button>

        {/* Hero Section */}
        <HeroSection product={product} />

        {/* Detailed Specifications */}
        <DetailedSpecs product={product} />

        {/* Price History */}
        <PriceHistoryChart product={product} />

        {/* Reviews Section */}
        <ReviewsSection product={product} />

        {/* FAQ Section */}
        <LaptopFAQ product={product} />

        {/* Similar Laptops */}
        <SimilarLaptops product={product} />
      </div>
    </>
  );
}
