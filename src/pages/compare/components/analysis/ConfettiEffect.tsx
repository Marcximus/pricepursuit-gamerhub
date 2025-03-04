
import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface ConfettiEffectProps {
  isActive: boolean;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ isActive }) => {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; top: string; color: string; size: string; duration: string }>>([]);
  
  useEffect(() => {
    if (!isActive) return;
    
    // Generate confetti particles
    const colors = ["#FFD700", "#FFA500", "#FF4500", "#9370DB", "#20B2AA"];
    const newParticles = [];
    
    for (let i = 0; i < 30; i++) {
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = `${Math.random() * 0.5 + 0.5}rem`;
      const duration = `${Math.random() * 2 + 1}s`;
      
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
    
    // Clear confetti after animation ends
    const timer = setTimeout(() => {
      setParticles([]);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isActive]);
  
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
          <Sparkles />
        </div>
      ))}
      
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfettiEffect;
