import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, DollarSign, Zap, Battery, Feather, TrendingUp, Eye, ExternalLink, Star } from "lucide-react";
import type { MockComparisonItem } from "../mockComparisonData";
import { getAffiliateUrl } from "../utils/affiliateUtils";

interface ComparisonHistoryCardProps {
  comparison: MockComparisonItem;
}

const getDifferentiatorIcon = (differentiator: string) => {
  const lower = differentiator.toLowerCase();
  if (lower.includes('value') || lower.includes('price')) return DollarSign;
  if (lower.includes('performance')) return Zap;
  if (lower.includes('battery')) return Battery;
  if (lower.includes('light') || lower.includes('weight')) return Feather;
  return Trophy;
};

const getDifferentiatorIconColor = (differentiator: string) => {
  const lower = differentiator.toLowerCase();
  if (lower.includes('value') || lower.includes('price')) return {
    icon: 'text-emerald-600',
    bg: 'bg-emerald-100'
  };
  if (lower.includes('performance')) return {
    icon: 'text-blue-600',
    bg: 'bg-blue-100'
  };
  if (lower.includes('battery')) return {
    icon: 'text-green-600',
    bg: 'bg-green-100'
  };
  if (lower.includes('light') || lower.includes('weight')) return {
    icon: 'text-purple-600',
    bg: 'bg-purple-100'
  };
  return {
    icon: 'text-yellow-600',
    bg: 'bg-yellow-100'
  };
};

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />);
    } else {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
    }
  }
  
  return stars;
};

const ComparisonHistoryCard: React.FC<ComparisonHistoryCardProps> = ({ comparison }) => {
  const DifferentiatorIcon = getDifferentiatorIcon(comparison.keyDifferentiator);
  const iconColors = getDifferentiatorIconColor(comparison.keyDifferentiator);
  
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const formatReviews = (reviews: number) => {
    if (reviews >= 1000) {
      return `${(reviews / 1000).toFixed(1)}k`;
    }
    return reviews.toString();
  };
  
  const getAffiliateLink = (asin: string) => {
    return getAffiliateUrl({ asin } as any);
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.005] border-border bg-card">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6">
          {/* Left Laptop Card */}
          <div className="relative">
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full">
              {/* Winner Badge */}
              {comparison.winner === 'left' && (
                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-fade-in">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-semibold">Winner</span>
                </div>
              )}

              {/* Image Section */}
              <a 
                href={getAffiliateLink(comparison.leftLaptopAsin)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full aspect-[4/3] overflow-hidden group"
              >
                <img 
                  src={comparison.leftLaptopImage} 
                  alt={comparison.leftLaptopModel}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </a>

              {/* Info Section */}
              <div className="p-5 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    {comparison.leftLaptopBrand}
                  </p>
                  <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-2">
                    {comparison.leftLaptopModel}
                  </h3>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {renderStars(comparison.leftLaptopRating)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({formatReviews(comparison.leftLaptopReviews)} reviews)
                  </span>
                </div>
                
                <p className="text-3xl font-bold text-foreground">
                  {formatPrice(comparison.leftLaptopPrice)}
                </p>
              </div>

              {/* Button Section */}
              <div className="p-5 pt-0">
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg h-11 transition-all duration-200"
                >
                  <a 
                    href={getAffiliateLink(comparison.leftLaptopAsin)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    Check It Out
                    <Zap className="w-4 h-4 animate-pulse" />
                  </a>
                </Button>
              </div>
            </Card>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/30">
              <span className="text-lg font-bold text-primary">VS</span>
            </div>
          </div>

          {/* Right Laptop Card */}
          <div className="relative">
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full">
              {/* Winner Badge */}
              {comparison.winner === 'right' && (
                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-fade-in">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-semibold">Winner</span>
                </div>
              )}
              {comparison.winner === 'tie' && (
                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-sky-100 to-amber-100 text-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-fade-in border border-slate-200">
                  <span className="text-sm font-semibold">Tie</span>
                </div>
              )}

              {/* Image Section */}
              <a 
                href={getAffiliateLink(comparison.rightLaptopAsin)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full aspect-[4/3] overflow-hidden group"
              >
                <img 
                  src={comparison.rightLaptopImage} 
                  alt={comparison.rightLaptopModel}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </a>

              {/* Info Section */}
              <div className="p-5 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    {comparison.rightLaptopBrand}
                  </p>
                  <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-2">
                    {comparison.rightLaptopModel}
                  </h3>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {renderStars(comparison.rightLaptopRating)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({formatReviews(comparison.rightLaptopReviews)} reviews)
                  </span>
                </div>
                
                <p className="text-3xl font-bold text-foreground">
                  {formatPrice(comparison.rightLaptopPrice)}
                </p>
              </div>

              {/* Button Section */}
              <div className="p-5 pt-0">
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg h-11 transition-all duration-200"
                >
                  <a 
                    href={getAffiliateLink(comparison.rightLaptopAsin)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    Check It Out
                    <Zap className="w-4 h-4 animate-pulse" />
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${iconColors.bg} shadow-md animate-pulse`}>
                <DifferentiatorIcon className={`h-6 w-6 ${iconColors.icon}`} />
              </div>
              <h4 className="font-bold text-foreground text-lg">
                {comparison.keyDifferentiator}
              </h4>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {comparison.analysisSummary}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4 animate-pulse" />
                <span>{comparison.comparisonCount} comparisons</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
                <TrendingUp className="h-4 w-4 animate-pulse" />
                <span>Trending</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonHistoryCard;
