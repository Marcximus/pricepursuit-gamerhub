
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
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Do you have a preferred brand?</h2>
      <div className="grid grid-cols-2 gap-3">
        {brandOptions.map((brand) => {
          // Skip "No preference" as it will be handled separately
          if (brand === "No preference") return null;
          
          return (
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
          );
        })}
        
        {/* Add No preference option separately - now spanning only 2 columns instead of 3 */}
        <Button
          variant={selectedBrand === "No preference" ? "default" : "outline"}
          className={`justify-start text-left h-auto py-2 px-4 transition-all duration-200 hover:shadow-md ${
            selectedBrand === "No preference" 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-white/80 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200'
          } rounded-xl col-span-2`}
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
    </>
  );
};
