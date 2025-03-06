
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Ready to join the hunt? 🏹</h2>
      <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
        Whether you're a tech newbie or a seasoned spec-comparing veteran, we've got your back in the laptop jungle.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/">
          <Button className="bg-gaming-600 hover:bg-gaming-700">
            Start Hunting Laptops <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
        <Link to="/recommend">
          <Button variant="outline">
            Find Your Perfect Match <Sparkles className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CtaSection;
