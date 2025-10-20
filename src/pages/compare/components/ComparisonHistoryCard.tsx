import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, DollarSign, Zap, Battery, Feather, TrendingUp, Eye, ExternalLink } from "lucide-react";
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

const ComparisonHistoryCard: React.FC<ComparisonHistoryCardProps> = ({ comparison }) => {
  const DifferentiatorIcon = getDifferentiatorIcon(comparison.keyDifferentiator);
  const iconColors = getDifferentiatorIconColor(comparison.keyDifferentiator);
  
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const getPriceDifference = () => {
    const diff = Math.abs(comparison.leftLaptopPrice - comparison.rightLaptopPrice);
    const cheaper = comparison.leftLaptopPrice < comparison.rightLaptopPrice ? 'left' : 'right';
    const percentage = ((diff / Math.max(comparison.leftLaptopPrice, comparison.rightLaptopPrice)) * 100).toFixed(0);
    return { diff, cheaper, percentage };
  };

  const priceDiff = getPriceDifference();
  
  const getAffiliateLink = (asin: string) => {
    return getAffiliateUrl({ asin } as any);
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.005] border-border bg-card">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Left Laptop */}
          <div className={`relative transition-all duration-300 ${comparison.winner === 'left' ? '' : comparison.winner === 'tie' ? '' : 'opacity-60'}`}>
            {comparison.winner === 'left' && (
              <Badge className="absolute -top-2 -right-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg z-10">
                <Trophy className="w-3 h-3 mr-1" />
                Winner
              </Badge>
            )}
            
            <div className="flex items-start gap-3">
              <div className="w-1/3 space-y-1.5">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{comparison.leftLaptopBrand}</p>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 mt-0.5">
                    {comparison.leftLaptopModel}
                  </h3>
                </div>
                
                <div>
                  <p className="text-xl font-bold text-foreground">{formatPrice(comparison.leftLaptopPrice)}</p>
                  {priceDiff.cheaper === 'left' && comparison.winner !== 'tie' && (
                    <Badge className="mt-0.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs py-0 px-1.5">
                      {priceDiff.percentage}% cheaper
                    </Badge>
                  )}
                  
                  <Button 
                    asChild
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white shadow-sm py-0.5 h-7"
                  >
                    <a 
                      href={getAffiliateLink(comparison.leftLaptopAsin)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 text-[10px]"
                    >
                      Check It Out
                      <Zap className="w-2.5 h-2.5 animate-pulse" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <img 
                src={comparison.leftLaptopImage} 
                alt={comparison.leftLaptopModel}
                className="w-2/3 h-48 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform duration-200 flex-shrink-0"
              />
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
              <Badge className="absolute -top-2 -right-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg z-10">
                <Trophy className="w-3 h-3 mr-1" />
                Winner
              </Badge>
            )}
            {comparison.winner === 'tie' && (
              <Badge variant="secondary" className="absolute -top-2 -right-2 shadow-lg z-10 border border-border">
                Tie
              </Badge>
            )}
            
            <div className="flex items-start gap-3">
              <div className="w-1/3 space-y-1.5">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{comparison.rightLaptopBrand}</p>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 mt-0.5">
                    {comparison.rightLaptopModel}
                  </h3>
                </div>
                
                <div>
                  <p className="text-xl font-bold text-foreground">{formatPrice(comparison.rightLaptopPrice)}</p>
                  {priceDiff.cheaper === 'right' && comparison.winner !== 'tie' && (
                    <Badge className="mt-0.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs py-0 px-1.5">
                      {priceDiff.percentage}% cheaper
                    </Badge>
                  )}
                  
                  <Button 
                    asChild
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white shadow-sm py-0.5 h-7"
                  >
                    <a 
                      href={getAffiliateLink(comparison.rightLaptopAsin)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 text-[10px]"
                    >
                      Check It Out
                      <Zap className="w-2.5 h-2.5 animate-pulse" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <img 
                src={comparison.rightLaptopImage} 
                alt={comparison.rightLaptopModel}
                className="w-2/3 h-48 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform duration-200 flex-shrink-0"
              />
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
