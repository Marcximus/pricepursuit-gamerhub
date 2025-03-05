
import React from 'react';
import ParticleSystem from '@/components/p5/ParticleSystem';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const P5Demo: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">p5.js Demo</h1>
        <p className="text-gray-500">
          An interactive particle system created with p5.js. Click on the canvas to add more particles!
        </p>
      </div>
      
      <ParticleSystem />
      
      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-2">About This Demo</h3>
        <p className="text-gray-700 mb-4">
          This interactive particle system was created using p5.js, a JavaScript library for creative coding.
          The particles respond to mouse clicks and have physics-based movement with acceleration and velocity.
        </p>
        <p className="text-gray-700">
          Try changing the particle density and color theme to see different effects!
        </p>
      </div>
    </div>
  );
};

export default P5Demo;
