
import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import type { ConfettiRef } from "@/components/ui/confetti";
import { Confetti } from "@/components/ui/confetti";

interface ConfettiEffectProps {
  isActive: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ isActive, containerRef }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);
  
  useEffect(() => {
    if (isActive) {
      setShowConfetti(true);
      
      // Reset after animation (10 seconds - extended duration)
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive]);
  
  useEffect(() => {
    if (showConfetti && containerRef.current) {
      // Get the card's position for the animation
      const rect = containerRef.current.getBoundingClientRect();
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
    }
  }, [showConfetti, containerRef]);
  
  return (
    <>
      {isActive && (
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
    </>
  );
};

export default ConfettiEffect;
