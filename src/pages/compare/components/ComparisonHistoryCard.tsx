import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, DollarSign, Zap, Battery, Feather, TrendingUp, Eye, ExternalLink, Star } from "lucide-react";
import type { MockComparisonItem } from "../mockComparisonData";
import { getAffiliateUrl } from "../utils/affiliateUtils";
import confetti from "canvas-confetti";

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
      stars.push(<Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />);
    } else {
      stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
    }
  }
  
  return stars;
};

const ComparisonHistoryCard: React.FC<ComparisonHistoryCardProps> = ({ comparison }) => {
  const DifferentiatorIcon = getDifferentiatorIcon(comparison.keyDifferentiator);
  const iconColors = getDifferentiatorIconColor(comparison.keyDifferentiator);
  const leftBadgeRef = useRef<HTMLDivElement>(null);
  const rightBadgeRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    const emitStars = (element: HTMLDivElement) => {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Random particle count for glittering effect
      const particleCount = Math.floor(Math.random() * 8) + 3; // 3-10 particles
      
      confetti({
        particleCount,
        angle: 90,
        spread: 360,
        startVelocity: Math.random() * 4 + 2, // 2-6 for varied speeds
        gravity: 0.15, // Even lighter for more floating
        scalar: 0.8 + Math.random() * 0.4, // 0.8-1.2 for size variety
        drift: (Math.random() - 0.5) * 0.5, // Random drift for fluid motion
        shapes: ['star'],
        colors: ['#FFD700', '#FDB931', '#FFED4E', '#FFA500'],
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        ticks: 50,
        zIndex: 5, // Behind the winner badge (badge is z-10)
      });
    };

    const intervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];

    const scheduleRandomEmission = (element: HTMLDivElement) => {
      const emit = () => {
        if (element) {
          emitStars(element);
        }
        // Random interval between 200-600ms for glittering effect
        const nextDelay = Math.random() * 400 + 200;
        const timeout = setTimeout(emit, nextDelay);
        timeouts.push(timeout);
      };
      emit();
    };

    if (comparison.winner === 'left' && leftBadgeRef.current) {
      scheduleRandomEmission(leftBadgeRef.current);
    }

    if (comparison.winner === 'right' && rightBadgeRef.current) {
      scheduleRandomEmission(rightBadgeRef.current);
    }

    return () => {
      intervals.forEach(interval => clearInterval(interval));
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [comparison.winner]);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.005] border-border bg-card">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Left Laptop */}
          <div className={`relative transition-all duration-300 ${comparison.winner === 'left' ? '' : comparison.winner === 'tie' ? '' : 'opacity-60'}`}>
            {comparison.winner === 'left' && (
              <div 
                ref={leftBadgeRef}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10"
              >
                <Trophy className="w-3 h-3" />
                <span className="text-sm font-semibold">Winner</span>
              </div>
            )}
            
            <div className="flex items-stretch gap-3 h-48">
              <div className="w-1/3 flex flex-col justify-end">
                <a 
                  href={getAffiliateLink(comparison.leftLaptopAsin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col space-y-1.5 mb-2 hover:opacity-80 transition-opacity"
                >
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{comparison.leftLaptopBrand}</p>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                    {comparison.leftLaptopModel}
                  </h3>
                  
                  <p className="text-xl font-bold text-foreground">{formatPrice(comparison.leftLaptopPrice)}</p>
                  
                  <div className="flex items-center gap-1">
                    {renderStars(comparison.leftLaptopRating)}
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({formatReviews(comparison.leftLaptopReviews)})
                    </span>
                  </div>
                </a>
                
                <Button 
                  asChild
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm py-1.5 h-9"
                >
                  <a 
                    href={getAffiliateLink(comparison.leftLaptopAsin)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold"
                  >
                    Check It Out
                    <Zap className="w-3.5 h-3.5 animate-pulse" />
                  </a>
                </Button>
              </div>
              
              <a 
                href={getAffiliateLink(comparison.leftLaptopAsin)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-2/3 block"
              >
                <img 
                  src={comparison.leftLaptopImage} 
                  alt={comparison.leftLaptopModel}
                  className="w-full h-48 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform duration-200"
                />
              </a>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center md:mx-4 my-4 md:my-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/30 shadow-sm">
              <span className="text-sm font-bold text-primary">VS</span>
            </div>
          </div>

          {/* Right Laptop */}
          <div className={`relative transition-all duration-300 ${comparison.winner === 'right' ? '' : comparison.winner === 'tie' ? '' : 'opacity-60'}`}>
            {comparison.winner === 'right' && (
              <div 
                ref={rightBadgeRef}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10"
              >
                <Trophy className="w-3 h-3" />
                <span className="text-sm font-semibold">Winner</span>
              </div>
            )}
            {comparison.winner === 'tie' && (
              <Badge variant="secondary" className="absolute -top-2 -right-2 shadow-lg z-10 border border-border">
                Tie
              </Badge>
            )}
            
            <div className="flex items-stretch gap-3 h-48">
              <div className="w-1/3 flex flex-col justify-end">
                <a 
                  href={getAffiliateLink(comparison.rightLaptopAsin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col space-y-1.5 mb-2 hover:opacity-80 transition-opacity"
                >
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{comparison.rightLaptopBrand}</p>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                    {comparison.rightLaptopModel}
                  </h3>
                  
                  <p className="text-xl font-bold text-foreground">{formatPrice(comparison.rightLaptopPrice)}</p>
                  
                  <div className="flex items-center gap-1">
                    {renderStars(comparison.rightLaptopRating)}
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({formatReviews(comparison.rightLaptopReviews)})
                    </span>
                  </div>
                </a>
                
                <Button 
                  asChild
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm py-1.5 h-9"
                >
                  <a 
                    href={getAffiliateLink(comparison.rightLaptopAsin)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold"
                  >
                    Check It Out
                    <Zap className="w-3.5 h-3.5 animate-pulse" />
                  </a>
                </Button>
              </div>
              
              <a 
                href={getAffiliateLink(comparison.rightLaptopAsin)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-2/3 block"
              >
                <img 
                  src={comparison.rightLaptopImage} 
                  alt={comparison.rightLaptopModel}
                  className="w-full h-48 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform duration-200"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="mt-6 pt-6 border-t border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${iconColors.bg} shadow-sm animate-pulse`}>
              <DifferentiatorIcon className={`h-5 w-5 ${iconColors.icon}`} />
            </div>
            <h4 className="font-semibold text-foreground text-base">{comparison.keyDifferentiator}</h4>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {comparison.analysisSummary}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="h-3 w-3 animate-pulse" />
              <span>{comparison.comparisonCount} comparisons</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 animate-pulse" />
              <span>Popular</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonHistoryCard;
