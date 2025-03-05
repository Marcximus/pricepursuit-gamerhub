
import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface P5CanvasProps {
  sketch: (p: p5) => void;
  className?: string;
}

const P5Canvas: React.FC<P5CanvasProps> = ({ sketch, className }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);

  useEffect(() => {
    // Create new p5 instance
    if (canvasRef.current && !p5Ref.current) {
      p5Ref.current = new p5(sketch, canvasRef.current);
    }

    // Cleanup on component unmount
    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, [sketch]);

  return <div ref={canvasRef} className={className} />;
};

export default P5Canvas;
