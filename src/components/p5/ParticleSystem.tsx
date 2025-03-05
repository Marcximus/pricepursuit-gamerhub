
import React, { useState } from 'react';
import P5Canvas from './P5Canvas';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Particle {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  color: number[];
  size: number;
  lifespan: number;
}

const ParticleSystem: React.FC = () => {
  const [particleCount, setParticleCount] = useState(50);
  const [colorMode, setColorMode] = useState<'rainbow' | 'blue' | 'purple'>('rainbow');

  const sketch = (p: p5) => {
    let particles: Particle[] = [];
    
    p.setup = () => {
      const canvas = p.createCanvas(p.windowWidth < 600 ? p.windowWidth - 40 : 600, 400);
      canvas.mousePressed(() => {
        // Add particles on click
        addParticles(p.mouseX, p.mouseY, 10);
      });
    };

    p.draw = () => {
      p.background(20, 20, 30, 20); // Semi-transparent background for trail effect
      
      // Update and display particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update
        particle.velocity.x += particle.acceleration.x;
        particle.velocity.y += particle.acceleration.y;
        particle.position.x += particle.velocity.x;
        particle.position.y += particle.velocity.y;
        particle.lifespan -= 2;
        
        // Display
        p.noStroke();
        p.fill(
          particle.color[0], 
          particle.color[1], 
          particle.color[2], 
          p.map(particle.lifespan, 0, 255, 0, 255)
        );
        p.ellipse(particle.position.x, particle.position.y, particle.size, particle.size);
        
        // Remove dead particles
        if (particle.lifespan <= 0) {
          particles.splice(i, 1);
        }
      }
      
      // Auto generate particles
      if (p.frameCount % 5 === 0) {
        addParticles(p.width / 2, p.height / 2, 3);
      }
    };
    
    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth < 600 ? p.windowWidth - 40 : 600, 400);
    };
    
    const addParticles = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        let color: number[];
        
        // Different color modes
        if (colorMode === 'rainbow') {
          color = [p.random(255), p.random(255), p.random(255)];
        } else if (colorMode === 'blue') {
          color = [100, 150, p.random(200, 255)];
        } else {
          color = [p.random(150, 200), 100, p.random(200, 255)];
        }
        
        particles.push({
          position: { x, y },
          velocity: { 
            x: p.random(-1, 1) * (particleCount / 50), 
            y: p.random(-1, 1) * (particleCount / 50)
          },
          acceleration: { x: p.random(-0.05, 0.05), y: p.random(-0.05, 0.05) },
          color,
          size: p.random(3, 8),
          lifespan: 255
        });
        
        // Limit total particles
        if (particles.length > particleCount * 2) {
          particles.shift();
        }
      }
    };
  };

  return (
    <Card className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Interactive Particle System</h2>
      
      <div className="mb-6">
        <P5Canvas sketch={sketch} className="w-full border border-gray-300 rounded-md mb-4" />
        <p className="text-sm text-gray-500 text-center mb-2">Click on the canvas to add particles!</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Particle Density: {particleCount}</Label>
          </div>
          <Slider 
            value={[particleCount]} 
            min={10} 
            max={200} 
            step={5}
            onValueChange={(value) => setParticleCount(value[0])}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Color Theme</Label>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={colorMode === 'rainbow' ? 'default' : 'outline'}
              onClick={() => setColorMode('rainbow')}
              className="bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white"
            >
              Rainbow
            </Button>
            <Button 
              variant={colorMode === 'blue' ? 'default' : 'outline'}
              onClick={() => setColorMode('blue')}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white"
            >
              Ocean Blue
            </Button>
            <Button 
              variant={colorMode === 'purple' ? 'default' : 'outline'}
              onClick={() => setColorMode('purple')}
              className="bg-gradient-to-r from-purple-400 to-purple-600 text-white"
            >
              Purple Haze
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ParticleSystem;
