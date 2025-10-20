import React, { useRef, useEffect } from 'react';
import { Star, Zap, Users, Sparkles, DollarSign, Monitor, Cpu, HardDrive, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MockRecommendationFind } from './mockRecommendationData';
import confetti from 'canvas-confetti';

interface RecentFindsCardProps {
  find: MockRecommendationFind;
}

interface PreferenceRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const PreferenceRow: React.FC<PreferenceRowProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors rounded px-2">
      <div className="text-muted-foreground shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-muted-foreground mb-0.5">{label}</div>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
};

interface RecommendationColumnProps {
  badgeNumber: number;
  laptopTitle: string;
  laptopBrand: string;
  laptopAsin: string;
  laptopImage: string;
  laptopRating: number;
  laptopReviews: number;
  laptopPrice: number;
  matchReason: string;
  badgeRef: React.RefObject<HTMLDivElement>;
}

const RecommendationColumn: React.FC<RecommendationColumnProps> = ({
  badgeNumber,
  laptopTitle,
  laptopBrand,
  laptopAsin,
  laptopImage,
  laptopRating,
  laptopReviews,
  laptopPrice,
  matchReason,
  badgeRef,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <div 
          ref={badgeRef}
          className={`mb-3 inline-flex text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg relative z-10 ${
            badgeNumber === 1 
              ? 'bg-gradient-to-r from-orange-400 via-yellow-500 to-amber-500' 
              : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600'
          }`}
        >
          Recommendation {badgeNumber}
        </div>
        <a 
          href={`https://www.amazon.com/dp/${laptopAsin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-square bg-white rounded-lg p-4 border-2 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <img
            src={laptopImage}
            alt={laptopTitle}
            className="w-full h-full object-contain"
          />
        </a>
      </div>
      
      <div className="flex-1 flex flex-col space-y-2">
        <a 
          href={`https://www.amazon.com/dp/${laptopAsin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xs font-semibold text-primary">{laptopBrand}</span>
          </div>
          <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight hover:opacity-80 transition-opacity">
            {laptopTitle}
          </h4>
        </a>
        <a 
          href={`https://www.amazon.com/dp/${laptopAsin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="flex">{renderStars(laptopRating)}</div>
          <span className="text-xs text-muted-foreground">
            ({laptopReviews.toLocaleString()})
          </span>
        </a>
        <a 
          href={`https://www.amazon.com/dp/${laptopAsin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity"
        >
          ${laptopPrice.toFixed(2)}
        </a>
        
        <div className="mt-auto pt-3 space-y-3">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{matchReason}</p>
            </div>
          </div>
          
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
            onClick={() => window.open(`https://www.amazon.com/dp/${laptopAsin}`, '_blank')}
          >
            Check It Out
            <Zap className="w-4 h-4 ml-2 animate-pulse" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const RecentFindsCard: React.FC<RecentFindsCardProps> = ({ find }) => {
  const leftBadgeRef = useRef<HTMLDivElement>(null);
  const rightBadgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const emitStars = (element: HTMLDivElement, colors: string[]) => {
      const rect = element.getBoundingClientRect();
      // Emit from random position within the badge
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;
      
      const particleCount = Math.floor(Math.random() * 8) + 3;
      
      confetti({
        particleCount,
        angle: 90,
        spread: 360,
        startVelocity: Math.random() * 4 + 2,
        gravity: 0.15,
        scalar: 0.8 + Math.random() * 0.4,
        drift: (Math.random() - 0.5) * 0.5,
        shapes: ['star'],
        colors: colors,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        ticks: 50,
        zIndex: 1,
      });
    };

    const timeouts: NodeJS.Timeout[] = [];

    const scheduleRandomEmission = (element: HTMLDivElement, colors: string[]) => {
      const emit = () => {
        if (element) {
          emitStars(element, colors);
        }
        const nextDelay = Math.random() * 400 + 200;
        const timeout = setTimeout(emit, nextDelay);
        timeouts.push(timeout);
      };
      emit();
    };

    // Orange/yellow stars for Recommendation 1
    if (leftBadgeRef.current) {
      scheduleRandomEmission(leftBadgeRef.current, ['#FFA500', '#FFD700', '#FF8C00', '#FFED4E']);
    }

    // Blue/purple stars for Recommendation 2
    if (rightBadgeRef.current) {
      scheduleRandomEmission(rightBadgeRef.current, ['#6366F1', '#8B5CF6', '#A855F7', '#7C3AED']);
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Column - User Preferences (40%) */}
          <div className="lg:col-span-4 space-y-4">
            {/* AI-Generated Headline */}
            <div className="mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Our Recommendation for a</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-clip-text text-transparent">
                {find.headline}
              </h3>
            </div>
            
            {/* User Preferences */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  User Preferences
                </span>
              </div>
              
              <PreferenceRow 
                icon={<Tag className="w-4 h-4" />}
                label="Use"
                value={find.usage}
              />
              <PreferenceRow 
                icon={<DollarSign className="w-4 h-4" />}
                label="Price Range"
                value={find.priceRange}
              />
              <PreferenceRow 
                icon={<Tag className="w-4 h-4" />}
                label="Preferred Brand"
                value={find.brand}
              />
              <PreferenceRow 
                icon={<Monitor className="w-4 h-4" />}
                label="Screen Size"
                value={find.screenSize}
              />
              <PreferenceRow 
                icon={<Cpu className="w-4 h-4" />}
                label="Graphics"
                value={find.graphics}
              />
              <PreferenceRow 
                icon={<HardDrive className="w-4 h-4" />}
                label="Storage"
                value={find.storage}
              />
            </div>
            
            {/* Find Count */}
            <div className="pt-3 mt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="font-medium">{find.findCount.toLocaleString()}</span>
                <span>people found similar matches</span>
              </div>
            </div>
          </div>
          
          {/* Middle Column - Recommendation 1 (30%) */}
          <div className="lg:col-span-3">
            <RecommendationColumn
              badgeNumber={1}
              laptopTitle={find.laptop1Title}
              laptopBrand={find.laptop1Brand}
              laptopAsin={find.laptop1Asin}
              laptopImage={find.laptop1Image}
              laptopRating={find.laptop1Rating}
              laptopReviews={find.laptop1Reviews}
              laptopPrice={find.laptop1Price}
              matchReason={find.matchReason1}
              badgeRef={leftBadgeRef}
            />
          </div>
          
          {/* Right Column - Recommendation 2 (30%) */}
          <div className="lg:col-span-3">
            <RecommendationColumn
              badgeNumber={2}
              laptopTitle={find.laptop2Title}
              laptopBrand={find.laptop2Brand}
              laptopAsin={find.laptop2Asin}
              laptopImage={find.laptop2Image}
              laptopRating={find.laptop2Rating}
              laptopReviews={find.laptop2Reviews}
              laptopPrice={find.laptop2Price}
              matchReason={find.matchReason2}
              badgeRef={rightBadgeRef}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentFindsCard;
