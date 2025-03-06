
import React from 'react';
import { GitCompare, Zap, Brain, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CompareLaptopsSection = () => {
  return (
    <div className="mb-16 bg-gaming-50 rounded-xl p-8">
      <div className="flex items-center justify-center mb-6">
        <GitCompare className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">Find the Best Laptop 🔍</h2>
      </div>
      <div className="text-lg text-gray-600 max-w-3xl mx-auto text-center">
        <p className="mb-6">
          Not sure which laptop is right for you? Let our powerful comparison tool do the hard work!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
              <GitCompare className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Compare Head-to-Head</h3>
            <p className="text-gray-600 text-center">
              Put any two laptops side by side for a detailed spec comparison.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
              <Zap className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analyze Performance</h3>
            <p className="text-gray-600 text-center">
              See which laptop performs better for your specific needs.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
              <Brain className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Recommendation</h3>
            <p className="text-gray-600 text-center">
              Our AI analyzes the specs and gives you a clear winner.
            </p>
          </div>
        </div>
        <Link to="/compare">
          <Button className="bg-gaming-600 hover:bg-gaming-700">
            Compare Laptops Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CompareLaptopsSection;
