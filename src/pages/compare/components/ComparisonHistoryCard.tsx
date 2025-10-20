import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, DollarSign, Zap, Battery, Feather, TrendingUp, Eye } from "lucide-react";
import type { MockComparisonItem } from "../mockComparisonData";
import Image from "@/components/ui/image";

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

const ComparisonHistoryCard: React.FC<ComparisonHistoryCardProps> = ({ comparison }) => {
  const DifferentiatorIcon = getDifferentiatorIcon(comparison.keyDifferentiator);
  
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const getWinnerStyle = (side: 'left' | 'right') => {
    if (comparison.winner === 'tie') return '';
    return comparison.winner === side ? 'bg-success/5 border-success/20' : 'opacity-75';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01] border-border">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Left Laptop */}
          <div className={`space-y-3 p-4 rounded-lg border ${getWinnerStyle('left')}`}>
            <div className="flex items-center justify-center mb-2">
              <Image 
                src={comparison.leftLaptopImage} 
                alt={comparison.leftLaptopModel}
                className="h-24 w-auto object-contain"
              />
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">{comparison.leftLaptopBrand}</p>
                <h3 className="font-semibold text-foreground line-clamp-2 mt-1">
                  {comparison.leftLaptopModel}
                </h3>
              </div>
              {comparison.winner === 'left' && (
                <Badge className="ml-2 bg-success text-success-foreground shrink-0">
                  Winner
                </Badge>
              )}
            </div>
            <p className="text-lg font-bold text-primary">{formatPrice(comparison.leftLaptopPrice)}</p>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center md:mx-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <span className="text-sm font-bold text-primary">VS</span>
              </div>
            </div>
          </div>

          {/* Right Laptop */}
          <div className={`space-y-3 p-4 rounded-lg border ${getWinnerStyle('right')}`}>
            <div className="flex items-center justify-center mb-2">
              <Image 
                src={comparison.rightLaptopImage} 
                alt={comparison.rightLaptopModel}
                className="h-24 w-auto object-contain"
              />
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">{comparison.rightLaptopBrand}</p>
                <h3 className="font-semibold text-foreground line-clamp-2 mt-1">
                  {comparison.rightLaptopModel}
                </h3>
              </div>
              {comparison.winner === 'right' && (
                <Badge className="ml-2 bg-success text-success-foreground shrink-0">
                  Winner
                </Badge>
              )}
              {comparison.winner === 'tie' && (
                <Badge variant="secondary" className="ml-2 shrink-0">
                  Tie
                </Badge>
              )}
            </div>
            <p className="text-lg font-bold text-primary">{formatPrice(comparison.rightLaptopPrice)}</p>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="mt-6 pt-6 border-t border-border space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <DifferentiatorIcon className="h-4 w-4 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">{comparison.keyDifferentiator}</h4>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {comparison.analysisSummary}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{comparison.comparisonCount} comparisons</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Popular</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonHistoryCard;
