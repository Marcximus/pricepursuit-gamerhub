
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const ConfettiEffect: React.FC = () => {
  useEffect(() => {
    const fireSideConfetti = () => {
      const end = Date.now() + 3 * 1000; // 3 seconds
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

      const frame = () => {
        if (Date.now() > end) return;

        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors: colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors: colors,
        });

        requestAnimationFrame(frame);
      };

      // Start the animation
      frame();
    };

    // Fire confetti when component mounts
    fireSideConfetti();

    // Clean up on unmount (if needed)
    return () => {
      // Nothing to clean up for this implementation
    };
  }, []);

  return null; // This component doesn't render anything
};
