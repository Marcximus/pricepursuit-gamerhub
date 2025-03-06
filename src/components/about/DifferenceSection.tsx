import React from 'react';
import { Sparkles, Trophy, Laptop, Users } from 'lucide-react';
const DifferenceSection = () => {
  return <div className="mb-16">
      <div className="flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">Why We're Different ✨</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center bg-orange-50">
          <div className="flex justify-center mb-4">
            <Trophy className="w-8 h-8 text-gaming-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Real-Time Price Tracking 📊</h3>
          <p className="text-gray-600">
            We hunt down the best deals so you don't have to. Our automated systems check prices across major retailers every 5 minutes!
          </p>
        </div>
        <div className="p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center bg-green-50">
          <div className="flex justify-center mb-4">
            <Laptop className="w-8 h-8 text-gaming-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Apples-to-Apples Comparisons 🍎</h3>
          <p className="text-gray-600">
            We normalize tech specs across brands and models so you can compare laptops without the marketing jargon confusion.
          </p>
        </div>
        <div className="p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center bg-blue-50">
          <div className="flex justify-center mb-4">
            <Users className="w-8 h-8 text-gaming-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Human-Friendly Tech Talk 🗣️</h3>
          <p className="text-gray-600">
            We translate complex specifications into human language. No more wondering what "integrated UHD graphics" actually means!
          </p>
        </div>
      </div>
    </div>;
};
export default DifferenceSection;