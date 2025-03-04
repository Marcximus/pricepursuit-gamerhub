
import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { Product } from "@/types/product";
import type { ConfettiRef } from "@/components/ui/confetti";
import { Confetti } from "@/components/ui/confetti";
import confetti from "canvas-confetti";

interface LaptopCardProps {
  laptop: Product | null;
  isWinner: boolean;
  formatPrice: (price?: number) => string;
}

const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, isWinner, formatPrice }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isWinner) {
      setShowConfetti(true);
      
      // Reset after animation (10 seconds - extended duration)
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isWinner]);
  
  useEffect(() => {
    if (showConfetti && cardRef.current) {
      // Get the card's position for the animation
      const rect = cardRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Create a more gentle firework effect using the direct confetti API
      const fireworkColors = ['#FFD700', '#FFA500', '#FF4500', '#9370DB', '#20B2AA', '#87CEFA', '#FF69B4'];
      
      const defaults = { 
        startVelocity: 20,  // Lower velocity for gentler effect
        spread: 360, 
        ticks: 150,  // Increase ticks for longer-lasting confetti
        zIndex: 0,
        colors: fireworkColors,
        decay: 0.94,  // Slower decay = longer lasting particles
        gravity: 0.5,  // Reduced gravity
      };
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      // Extended animation duration
      const animationEnd = Date.now() + 8000; // animation will last 8 seconds
      
      // Create a collection of different burst timings for more randomness
      const burstTimings = [];
      let currentTime = 0;
      
      // Generate 15-25 random burst timings throughout the animation duration
      const numBursts = Math.floor(randomInRange(15, 25));
      for (let i = 0; i < numBursts; i++) {
        // More random intervals between bursts
        currentTime += randomInRange(150, 750);
        if (currentTime < 8000) {
          burstTimings.push(currentTime);
        }
      }
      
      // Schedule each burst independently
      burstTimings.forEach(timing => {
        setTimeout(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return;
          
          // More random particle count
          const particleCount = Math.floor(randomInRange(20, 60) * (timeLeft / 8000));
          
          // Random positions for each burst with wider spread
          const xOffset = randomInRange(-0.5, 0.5);
          const yOffset = randomInRange(-0.4, 0.4);
          
          // Central burst with some randomness
          confetti({
            ...defaults,
            particleCount,
            origin: { 
              x: Math.max(0.1, Math.min(0.9, (x + xOffset * rect.width) / window.innerWidth)),
              y: Math.max(0.1, Math.min(0.9, (y + yOffset * rect.height) / window.innerHeight))
            }
          });
          
          // Random chance for additional side bursts
          if (Math.random() > 0.35) {
            // Left side burst
            confetti({
              ...defaults,
              particleCount: particleCount * randomInRange(0.3, 0.6),
              origin: { 
                x: Math.max(0.1, (x - 150 * randomInRange(0.8, 1.5)) / window.innerWidth),
                y: Math.max(0.1, Math.min(0.9, (y + randomInRange(-50, 50)) / window.innerHeight))
              }
            });
          }
          
          if (Math.random() > 0.35) {
            // Right side burst
            confetti({
              ...defaults,
              particleCount: particleCount * randomInRange(0.3, 0.6),
              origin: { 
                x: Math.min(0.9, (x + 150 * randomInRange(0.8, 1.5)) / window.innerWidth),
                y: Math.max(0.1, Math.min(0.9, (y + randomInRange(-50, 50)) / window.innerHeight))
              }
            });
          }
          
          // Occasional top/bottom bursts for extra randomness
          if (Math.random() > 0.6) {
            confetti({
              ...defaults,
              particleCount: particleCount * randomInRange(0.2, 0.4),
              origin: { 
                x: Math.max(0.1, Math.min(0.9, (x + randomInRange(-100, 100)) / window.innerWidth)),
                y: Math.max(0.1, (y - 100 * randomInRange(0.5, 1.2)) / window.innerHeight)
              }
            });
          }
          
        }, timing);
      });
      
      return () => {
        // No need to clear timeouts as they're one-time events
      };
    }
  }, [showConfetti]);
  
  // Create an affiliate URL for the product
  const getAffiliateUrl = (product: Product | null): string => {
    if (!product || !product.asin) return '#';
    return `https://amazon.com/dp/${product.asin}?tag=with-laptop-discount-20`;
  };
  
  if (!laptop) {
    return (
      <Card className="p-4 h-full flex flex-col">
        <div className="text-center p-8 text-muted-foreground">
          No laptop selected
        </div>
      </Card>
    );
  }
  
  const affiliateUrl = getAffiliateUrl(laptop);
  
  return (
    <Card ref={cardRef} className="p-4 h-full flex flex-col relative">
      {/* Confetti effect for winner - positioned to fill the card */}
      {isWinner && (
        <Confetti
          ref={confettiRef}
          className="absolute inset-0 pointer-events-none"
          manualstart={true}
          options={{
            colors: ['#FFD700', '#FFA500', '#FF4500', '#9370DB', '#20B2AA', '#87CEFA', '#FF69B4'],
            disableForReducedMotion: true
          }}
        />
      )}
      
      {/* Winner badge positioned absolutely to not affect layout */}
      {isWinner && (
        <div className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium shadow-sm">
          <Trophy className="w-4 h-4" />
          Winner
        </div>
      )}
      
      {/* Add min-height to ensure consistent image area regardless of winner badge */}
      <div className="text-center mb-4 mt-8 min-h-[10rem] flex items-center justify-center">
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:opacity-90 transition-opacity"
        >
          <img 
            src={laptop.image_url || '/placeholder.svg'} 
            alt={laptop.title || 'Laptop'} 
            className="h-40 object-contain mx-auto"
          />
        </a>
      </div>
      
      <h3 className="text-lg font-semibold mb-1">{laptop.brand} {laptop.model}</h3>
      <p className="text-sm text-muted-foreground mb-2">{laptop.title}</p>
      
      <div className="mt-auto pt-4">
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          <p className="text-2xl font-bold">{formatPrice(laptop.current_price)}</p>
          {laptop.original_price && laptop.original_price > laptop.current_price && (
            <p className="text-sm text-muted-foreground line-through">{formatPrice(laptop.original_price)}</p>
          )}
        </a>
      </div>
    </Card>
  );
};

export default LaptopCard;
