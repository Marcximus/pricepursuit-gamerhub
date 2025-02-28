
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showTicks?: boolean;
    tickCount?: number;
    tickLabels?: string[];
  }
>(({ className, showTicks = false, tickCount = 5, tickLabels, ...props }, ref) => {
  const max = props.max || 100;
  const min = props.min || 0;
  
  // Generate tick marks
  const renderTicks = () => {
    if (!showTicks) return null;
    
    const ticks = [];
    const count = tickLabels ? tickLabels.length : tickCount;
    
    for (let i = 0; i < count; i++) {
      const position = tickLabels ? (i / (count - 1) * 100) : (i / (count - 1) * 100);
      const label = tickLabels ? tickLabels[i] : Math.round(min + (i / (count - 1)) * (max - min)).toString();
      
      ticks.push(
        <div 
          key={i} 
          className="absolute -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${position}%` }}
        >
          <div className="w-0.5 h-1.5 bg-slate-400 mb-1.5" />
          <span className="text-xs text-slate-500">{label}</span>
        </div>
      );
    }
    
    return (
      <div className="relative w-full h-6 mt-1">
        {ticks}
      </div>
    );
  };

  return (
    <div className={cn("space-y-1", showTicks && "mb-6")}>
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {Array.isArray(props.defaultValue) ? (
          props.defaultValue.map((_, i) => (
            <SliderPrimitive.Thumb
              key={i}
              className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            />
          ))
        ) : (
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        )}
      </SliderPrimitive.Root>
      {renderTicks()}
    </div>
  );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
