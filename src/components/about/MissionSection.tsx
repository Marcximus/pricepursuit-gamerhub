
import React from 'react';
import { Target } from 'lucide-react';
import { ConfettiButton } from '@/components/ui/confetti';
import { useIsMobile } from '@/hooks/use-mobile';

const MissionSection = () => {
  const isMobile = useIsMobile();

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center mb-6">
        <Target className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-gaming-600 mr-2`} />
        <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>Our Mission 🎯</h2>
      </div>
      <p className={`${isMobile ? 'text-base px-2' : 'text-lg'} text-gray-600 text-center max-w-3xl mx-auto mb-6 font-normal`}>
        At Laptop Hunter, we're on a wild mission to make laptop shopping actually... fun! 🤯 We believe finding your perfect tech companion shouldn't require a computer science degree or endless hours of research. We're here to simplify the hunt and help you track down your ideal laptop at the best possible price!
        Isn't that great??
      </p>
      <div className="flex justify-center">
        <ConfettiButton
          variant="default"
          className={`hover:bg-gaming-700 ${isMobile ? 'w-full mx-4' : 'px-6'} py-2 text-lg font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-50`}
          options={{ particleCount: 200, spread: 100, ticks: 400, gravity: 0.8, decay: 0.94, startVelocity: 45 }}
        >
          🎉 Yes! Huuray! 🎉
        </ConfettiButton>
      </div>
    </div>
  );
};

export default MissionSection;
