
import React from 'react';
import P5Canvas from '../p5/P5Canvas';
import p5 from 'p5';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: p5.Color;
  speed: number;
  angle: number;
}

const LaptopParticles: React.FC = () => {
  const sketch = (p: p5) => {
    const particles: Particle[] = [];
    const particleCount = 25;
    
    // Define color palette for technology theme
    const colors = [
      [66, 133, 244],  // Blue
      [52, 168, 83],   // Green
      [251, 188, 5],   // Yellow
      [234, 67, 53],   // Red
      [103, 58, 183]   // Purple
    ];
    
    // Setup function runs once at the beginning
    p.setup = () => {
      p.createCanvas(p.windowWidth, 260);
      p.noStroke();
      
      // Create particles
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: p.random(p.width),
          y: p.random(p.height),
          size: p.random(5, 15),
          color: p.color(colors[Math.floor(p.random(colors.length))]),
          speed: p.random(0.5, 2),
          angle: p.random(p.TWO_PI)
        });
      }
    };
    
    // Draw function runs continuously
    p.draw = () => {
      p.clear();
      
      // Draw and update each particle
      particles.forEach(particle => {
        p.fill(particle.color);
        p.circle(particle.x, particle.y, particle.size);
        
        // Move particles
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        
        // Slightly change direction
        particle.angle += p.random(-0.05, 0.05);
        
        // Wrap around the screen
        if (particle.x < 0) particle.x = p.width;
        if (particle.x > p.width) particle.x = 0;
        if (particle.y < 0) particle.y = p.height;
        if (particle.y > p.height) particle.y = 0;
      });
      
      // Draw laptop icons occasionally
      if (p.frameCount % 120 === 0) {
        drawLaptopIcon(p.random(p.width), p.random(p.height), p.random(20, 40));
      }
    };
    
    // Draw a simple laptop icon
    const drawLaptopIcon = (x: number, y: number, size: number) => {
      p.push();
      p.translate(x, y);
      
      // Laptop base
      p.fill(50);
      p.rect(0, size * 0.7, size, size * 0.1, 2);
      
      // Laptop screen
      p.fill(70);
      p.rect(size * 0.1, 0, size * 0.8, size * 0.7, 2, 2, 0, 0);
      
      // Screen content
      p.fill(150, 200, 255);
      p.rect(size * 0.15, size * 0.1, size * 0.7, size * 0.5);
      
      p.pop();
    };
    
    // Adjust canvas size when window is resized
    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, 260);
    };
  };

  return <P5Canvas sketch={sketch} className="w-full h-[260px] absolute top-0 left-0 -z-10" />;
};

export default LaptopParticles;
