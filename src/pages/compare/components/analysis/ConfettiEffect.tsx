
import React, { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";

interface ConfettiEffectProps {
  isActive: boolean;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ isActive }) => {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; top: string; color: string; size: string; duration: string }>>([]);
  
  useEffect(() => {
    if (!isActive) return;
    
    // Generate confetti particles
    const colors = ["#FFD700", "#FFA500", "#FF4500", "#9370DB", "#20B2AA", "#FF1493", "#00CED1"];
    const newParticles = [];
    
    for (let i = 0; i < 40; i++) {
      // Wider spread for more festive appearance
      const left = `${Math.random() * 120 - 10}%`;
      const top = `${Math.random() * 80}%`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = `${Math.random() * 0.7 + 0.3}rem`;
      // Randomize duration between 2-4 seconds for a more natural effect
      const duration = `${Math.random() * 2 + 2}s`;
      
      newParticles.push({
        id: i,
        left,
        top,
        color,
        size,
        duration
      });
    }
    
    setParticles(newParticles);
    
    // Clear confetti after animation ends (4 seconds)
    const timer = setTimeout(() => {
      setParticles([]);
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [isActive]);
  
  if (!isActive) return null;
  
  return (
    <div className="absolute w-full h-full overflow-visible pointer-events-none z-10">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-fall"
          style={{
            left: p.left,
            top: p.top,
            color: p.color,
            fontSize: p.size,
            animation: `fall ${p.duration} ease-out forwards`
          }}
        >
          <PartyPopper />
        </div>
      ))}
      
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-20px) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            100% {
              transform: translateY(150px) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ConfettiEffect;
