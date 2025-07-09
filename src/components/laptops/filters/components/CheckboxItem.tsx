
import React, { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "@/components/ui/image";

type CheckboxItemProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  showBrandLogo?: boolean;
};

export function CheckboxItem({ id, label, checked, onCheckedChange, showBrandLogo = false }: CheckboxItemProps) {
  const handleCheckedChange = useCallback((checked: boolean | "indeterminate") => {
    onCheckedChange(checked === true);
  }, [onCheckedChange]);

  // Brand name to filename mapping for logos
  const getBrandImageUrl = (brandName: string) => {
    const brandFileMap: Record<string, string> = {
      'Apple': 'apple.png',
      'Dell': 'dell.png',
      'HP': 'hp.png',
      'Lenovo': 'lenovo.png',
      'ASUS': 'asus.png',
      'Acer': 'acer.png',
      'MSI': 'msi.png',
      'Microsoft': 'microsoft_surface.png',
      'Microsoft Surface': 'microsoft_surface.png',
      'Samsung': 'samsung.png',
      'Razer': 'razer.png',
      'LG': 'lg.png',
      'Gigabyte': 'gigabyte.png',
      'Toshiba': 'toshiba.png'
    };
    
    const fileName = brandFileMap[brandName];
    return fileName ? `https://kkebyebrhdpcwqnxhjcx.supabase.co/storage/v1/object/public/brand_logos/${fileName}` : null;
  };

  const logoUrl = showBrandLogo ? getBrandImageUrl(label) : null;

  return (
    <div className="flex items-center space-x-2 py-1 px-3 rounded hover:bg-green-50 transition-colors cursor-pointer">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        className="h-2.5 w-2.5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 border-slate-300 [&>*]:h-2 [&>*]:w-2"
      />
      <label
        htmlFor={id}
        className="text-sm leading-none cursor-pointer flex-1 text-slate-700 font-medium py-1 flex items-center"
      >
        {showBrandLogo && logoUrl && (
          <div className="w-4 h-4 mr-2 flex-shrink-0 overflow-hidden">
            <Image 
              src={logoUrl}
              alt={label}
              className="w-full h-full object-contain"
              width={16}
              height={16}
            />
          </div>
        )}
        {label}
      </label>
    </div>
  );
}
