import React from 'react';
import { Clock, Coffee } from 'lucide-react';
const OriginStorySection = () => {
  return <div className="rounded-xl p-8 mb-16 bg-sky-50">
      <div className="flex items-center justify-center mb-6">
        <Clock className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">Our Origin Story 📚</h2>
      </div>
      <div className="text-lg text-gray-600 max-w-3xl mx-auto">
        <p className="mb-4">
          Laptop Hunter was born from frustration (like all good things, right? 😅). Our founder spent three weeks comparing laptops across dozens of websites, creating spreadsheets, and still feeling uncertain about making the right choice.
        </p>
        <p className="mb-4">
          The breaking point? Finding the same laptop with a $400 price difference between two retailers! 💸 That's when the light bulb moment happened – why isn't there a single place to compare all laptop models AND track their prices across different retailers?
        </p>
        <p>
          And thus, in a caffeinated haze of determination <Coffee className="inline w-4 h-4" />, Laptop Hunter was born in 2023. We've been helping confused laptop shoppers ever since!
        </p>
      </div>
    </div>;
};
export default OriginStorySection;