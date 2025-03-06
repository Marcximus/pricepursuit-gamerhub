import React from 'react';
import { Target } from 'lucide-react';
import { ConfettiButton } from '@/components/ui/confetti';
const MissionSection = () => {
  return <div className="mb-16">
      <div className="flex items-center justify-center mb-6">
        <Target className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">Our Mission 🎯</h2>
      </div>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-6 font-normal">At Laptop Hunter, we're on a wild mission to make laptop shopping actually... fun! 🤯 We believe finding your perfect tech companion shouldn't require a computer science degree or endless hours of research. We're here to simplify the hunt and help you track down your ideal laptop at the best possible price!
Isn't that great??</p>
      <div className="flex justify-center">
        <ConfettiButton variant="default" className="bg-gaming-600 hover:bg-gaming-700 text-white font-medium px-6 py-2 rounded-md">
          🎉 Huuray! 🎉
        </ConfettiButton>
      </div>
    </div>;
};
export default MissionSection;