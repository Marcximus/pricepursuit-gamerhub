import React from 'react';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import { brandOptions } from './config/quizConfig';

interface BrandSelectionProps {
  selectedBrand: string;
  onSelect: (value: string) => void;
}

export const BrandSelection: React.FC<BrandSelectionProps> = ({
  selectedBrand,
  onSelect
}) => {
  // Filter out "No preference" from regular options as we'll place it separately
  const regularBrandOptions = brandOptions.filter(brand => brand !== "No preference");

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Do you have a preferred brand?</h2>
      
      {/* Top row with balanced brand options and No preference */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* First brand in top left */}
        <Button
          key={regularBrandOptions[0]}
          variant={selectedBrand === regularBrandOptions[0] ? "default" : "outline"}
          className={`justify-start text-left h-auto py-2 px-4 transition-all duration-200 hover:shadow-md ${
            selectedBrand === regularBrandOptions[0] 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-white/80 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200'
          } rounded-xl`}
          onClick={() => onSelect(regularBrandOptions[0])}
        >
          <div className="flex items-center">
            <div className="w-6 h-6 mr-2 flex-shrink-0 overflow-hidden">
              <Image 
                src={`https://kkebyebrhdpcwqnxhjcx.supabase.co/storage/v1/object/public/brand_logos/${regularBrandOptions[0].toLowerCase().replace(/ /g, '_')}.png`} 
                alt={regularBrandOptions[0]}
                className="w-full h-full object-contain"
                width={24}
                height={24}
              />
            </div>
            <span className="font-medium">{regularBrandOptions[0]}</span>
          </div>
        </Button>
        
        {/* No preference in top right */}
        <Button
          variant={selectedBrand === "No preference" ? "default" : "outline"}
          className={`justify-start text-left h-auto py-2 px-4 transition-all duration-200 hover:shadow-md ${
            selectedBrand === "No preference" 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-white/80 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200'
          } rounded-xl`}
          onClick={() => onSelect("No preference")}
        >
          <div className="flex items-center">
            <div className="w-6 h-6 mr-2 flex-shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-medium">No preference</span>
          </div>
        </Button>
      </div>
      
      {/* Rest of the brands in the grid */}
      <div className="grid grid-cols-2 gap-3">
        {regularBrandOptions.slice(1).map((brand) => (
          <Button
            key={brand}
            variant={selectedBrand === brand ? "default" : "outline"}
            className={`justify-start text-left h-auto py-2 px-4 transition-all duration-200 hover:shadow-md ${
              selectedBrand === brand 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-white/80 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200'
            } rounded-xl`}
            onClick={() => onSelect(brand)}
          >
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2 flex-shrink-0 overflow-hidden">
                <Image 
                  src={`https://kkebyebrhdpcwqnxhjcx.supabase.co/storage/v1/object/public/brand_logos/${brand.toLowerCase().replace(/ /g, '_')}.png`} 
                  alt={brand}
                  className="w-full h-full object-contain"
                  width={24}
                  height={24}
                />
              </div>
              <span className="font-medium">{brand}</span>
            </div>
          </Button>
        ))}
      </div>
    </>
  );
};
