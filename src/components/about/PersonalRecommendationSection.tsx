
import React from 'react';
import { WandSparkles, User, Brain, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PersonalRecommendationSection = () => {
  return (
    <div className="mb-16 bg-blue-50 rounded-xl p-8">
      <div className="flex items-center justify-center mb-6">
        <WandSparkles className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">Personal Laptop Finder 🧙‍♂️</h2>
      </div>
      <div className="text-lg text-gray-600 max-w-3xl mx-auto text-center">
        <p className="mb-6">
          Not sure where to start? Let our AI-powered recommendation tool find your perfect match!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
              <User className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tailored to You</h3>
            <p className="text-gray-600 text-center">
              Answer a few simple questions about your needs and preferences.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
              <Brain className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-gray-600 text-center">
              Our AI analyzes thousands of laptops to find your ideal matches.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full p-4 mb-3 w-16 h-16 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized Results</h3>
            <p className="text-gray-600 text-center">
              Get custom laptop recommendations with detailed explanations.
            </p>
          </div>
        </div>
        <Link to="/recommend">
          <Button className="bg-gaming-600 hover:bg-gaming-700">
            Find Your Perfect Laptop <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PersonalRecommendationSection;
