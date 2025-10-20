import React, { useRef, useEffect } from 'react';
import { Star, ExternalLink, Users, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MockRecommendationFind } from './mockRecommendationData';
import confetti from 'canvas-confetti';

interface RecentFindsCardProps {
  find: MockRecommendationFind;
}

const RecentFindsCard: React.FC<RecentFindsCardProps> = ({ find }) => {
  const leftBadgeRef = useRef<HTMLDivElement>(null);
  const rightBadgeRef = useRef<HTMLDivElement>(null);

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
        gravity: 0.15, // Light for floating effect
        scalar: 0.8 + Math.random() * 0.4, // 0.8-1.2 for size variety
        drift: (Math.random() - 0.5) * 0.5, // Random drift for fluid motion
        shapes: ['star'],
        colors: ['#FFD700', '#FDB931', '#FFED4E', '#FFA500'],
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        ticks: 50,
        zIndex: 5, // Behind the badges (badges are z-10)
      });
    };

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

    if (leftBadgeRef.current) {
      scheduleRandomEmission(leftBadgeRef.current);
    }

    if (rightBadgeRef.current) {
      scheduleRandomEmission(rightBadgeRef.current);
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const usageColors: Record<string, string> = {
    Gaming: 'bg-purple-100 text-purple-700 border-purple-300',
    Business: 'bg-blue-100 text-blue-700 border-blue-300',
    Student: 'bg-green-100 text-green-700 border-green-300',
    'Creative Work': 'bg-pink-100 text-pink-700 border-pink-300',
    'Everyday Use': 'bg-amber-100 text-amber-700 border-amber-300',
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 border-b">
        <div className="flex items-center justify-between">
          <Badge className={`${usageColors[find.usage] || 'bg-gray-100 text-gray-700'} border`}>
            {find.usage}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="font-medium">{find.findCount.toLocaleString()}</span>
            <span>finds</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Laptop 1 */}
          <div className="space-y-4">
            <div className="relative">
              <div 
                ref={leftBadgeRef}
                className="absolute top-2 left-2 z-10 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg"
              >
                Recommendation 1
              </div>
              <div className="aspect-square bg-white rounded-lg p-4 border-2 hover:border-primary/50 transition-colors">
                <img
                  src={find.laptop1Image}
                  alt={find.laptop1Title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{find.laptop1Brand}</span>
              </div>
              <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
                {find.laptop1Title}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(find.laptop1Rating)}</div>
                <span className="text-sm text-muted-foreground">
                  ({find.laptop1Reviews.toLocaleString()})
                </span>
              </div>
              <p className="text-2xl font-bold text-primary">
                ${find.laptop1Price.toFixed(2)}
              </p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open(`https://www.amazon.com/dp/${find.laptop1Asin}`, '_blank')}
              >
                Check It Out
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Laptop 2 */}
          <div className="space-y-4">
            <div className="relative">
              <div 
                ref={rightBadgeRef}
                className="absolute top-2 right-2 z-10 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg"
              >
                Recommendation 2
              </div>
              <div className="aspect-square bg-white rounded-lg p-4 border-2 hover:border-primary/50 transition-colors">
                <img
                  src={find.laptop2Image}
                  alt={find.laptop2Title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{find.laptop2Brand}</span>
              </div>
              <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
                {find.laptop2Title}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(find.laptop2Rating)}</div>
                <span className="text-sm text-muted-foreground">
                  ({find.laptop2Reviews.toLocaleString()})
                </span>
              </div>
              <p className="text-2xl font-bold text-primary">
                ${find.laptop2Price.toFixed(2)}
              </p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open(`https://www.amazon.com/dp/${find.laptop2Asin}`, '_blank')}
              >
                Check It Out
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Match Reason */}
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why These Laptops?</h4>
              <p className="text-sm text-muted-foreground">{find.matchReason}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentFindsCard;
