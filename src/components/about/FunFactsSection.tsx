import React from 'react';
const FunFactsSection = () => {
  return <div className="bg-gaming-50 rounded-xl p-8 mb-16 bg-green-50">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Fun Facts About Us 🎮</h2>
      <ul className="space-y-4 max-w-2xl mx-auto text-lg">
        <li className="flex items-start">
          <span className="text-2xl mr-2">🔍</span>
          <span>We've analyzed over 5,000 laptops so you don't have to compare them yourself.</span>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-2">💰</span>
          <span>Our price tracking has helped users save an average of $247 on their laptop purchases.</span>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-2">🏆</span>
          <span>The most expensive laptop we've ever tracked cost more than our first car. We're still not over it.</span>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-2">☕</span>
          <span>Our team consumes approximately 738 cups of coffee per month to keep the laptop data flowing.</span>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-2">🐶</span>
          <span>We have an office dog named Pixel who has accidentally ordered three laptops with his paws. He has excellent taste though.</span>
        </li>
      </ul>
    </div>;
};
export default FunFactsSection;