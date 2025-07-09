import React from 'react';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import { brandOptions, brandEmojis } from './config/quizConfig';
import { useIsMobile } from '@/hooks/use-mobile';

interface BrandSelectionProps {
  selectedBrand: string;
  onSelect: (value: string) => void;
}

export const BrandSelection: React.FC<BrandSelectionProps> = ({
  selectedBrand,
  onSelect
}) => {
  const isMobile = useIsMobile();
  
  // Filter out "No preference" from regular options as we'll place it separately
  const regularBrandOptions = brandOptions.filter(brand => brand !== "No preference");

  return (
    <>
      <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-800 mb-4`}>
        Do you have a preferred brand?
      </h2>
      
      {/* Top row with No preference - Centered */}
      <div className={`flex justify-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <Button
          variant={selectedBrand === "No preference" ? "default" : "outline"}
          className={`justify-start text-left h-auto py-2 px-4 transition-all duration-200 hover:shadow-md ${
            selectedBrand === "No preference" 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-white/80 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200'
          } rounded-xl min-w-[200px]`}
          onClick={() => onSelect("No preference")}
        >
          <div className="flex items-center">
            <div className="w-6 h-6 mr-2 flex-shrink-0 flex items-center justify-center">
              <span role="img" aria-label="Globe" className="text-lg">🌐</span>
            </div>
            <span className="font-medium">No preference</span>
          </div>
        </Button>
      </div>
      
      {/* Brand grid - Two columns */}
      <div className={`grid grid-cols-2 ${isMobile ? 'gap-2' : 'gap-3'}`}>
        {regularBrandOptions.slice(1).map((brand) => {
          // Using the exact brand position from the screenshot
          return (
            <Button
              key={brand}
              variant={selectedBrand === brand ? "default" : "outline"}
              className={`justify-start text-left h-auto py-2 px-3 transition-all duration-200 hover:shadow-md ${
                selectedBrand === brand 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-white/80 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200'
              } rounded-xl`}
              onClick={() => onSelect(brand)}
            >
              <div className="flex items-center min-w-0">
                <div className="w-5 h-5 mr-2 flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 rounded text-xs font-bold">
                  {brand.charAt(0)}
                </div>
                <span className="font-medium truncate text-sm">{brand}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </>
  );
};
