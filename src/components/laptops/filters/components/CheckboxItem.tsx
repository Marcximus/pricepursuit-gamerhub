import React, { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import Image from "@/components/ui/image";
type CheckboxItemProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  showBrandLogo?: boolean;
};
export function CheckboxItem({
  id,
  label,
  checked,
  onCheckedChange,
  showBrandLogo = false
}: CheckboxItemProps) {
  const handleCheckedChange = useCallback((checked: boolean | "indeterminate") => {
    onCheckedChange(checked === true);
  }, [onCheckedChange]);

  // Brand name to filename mapping for logos
  const getBrandImageUrl = (brandName: string) => {
    const brandFileMap: Record<string, string> = {
      'Apple': 'apple.png',
      'Dell': 'dell.png',
      'DELL': 'dell.png',
      'HP': 'hp.png',
      'hp': 'hp.png',
      'Lenovo': 'lenovo.png',
      'lenovo': 'lenovo.png',
      'LENOVO': 'lenovo.png',
      'ASUS': 'asus.png',
      'asus': 'asus.png',
      'Asus': 'asus.png',
      'Acer': 'acer.png',
      'acer': 'acer.png',
      'MSI': 'msi.png',
      'msi': 'msi.png',
      'Microsoft': 'microsoft_surface.png',
      'microsoft': 'microsoft_surface.png',
      'MICROSOFT': 'microsoft_surface.png',
      'Microsoft Surface': 'microsoft_surface.png',
      'Microsoft surface': 'microsoft_surface.png',
      'Samsung': 'samsung.png',
      'SAMSUNG': 'samsung.png',
      'Razer': 'razer.png',
      'razer': 'razer.png',
      'LG': 'lg.png',
      'Gigabyte': 'gigabyte.png',
      'GIGABYTE': 'gigabyte.png',
      'Toshiba': 'toshiba.png',
      'TOSHIBA': 'toshiba.png',
      'Alienware': 'alienware.png',
      'ACEMAGIC': 'Acemagic.png',
      'Acemagic': 'Acemagic.png',
      'Jumper': 'jumper.png',
      'jumper': 'jumper.png',
      'KAIGERR': 'Kaigerr.png',
      'Kaigerr': 'Kaigerr.png',
      'NIMO': 'Nimo.png',
      'Nimo': 'Nimo.png',
      'Others': 'Other.png',
      'Other': 'Other.png'
    };
    const fileName = brandFileMap[brandName];
    return fileName ? `https://kkebyebrhdpcwqnxhjcx.supabase.co/storage/v1/object/public/brand_logos/${fileName}` : null;
  };
  const logoUrl = showBrandLogo ? getBrandImageUrl(label) : null;
  
  return (
    <div className="flex items-center space-x-2 py-1 px-3 rounded hover:bg-green-50 transition-colors cursor-pointer">
      <div 
        className={`relative w-4 h-4 rounded-full border-2 transition-all cursor-pointer ${
          checked 
            ? 'bg-green-600 border-green-600' 
            : 'bg-white border-slate-300 hover:border-green-400'
        }`}
        onClick={() => onCheckedChange(!checked)}
      >
        {checked && (
          <X className="w-2.5 h-2.5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
        )}
      </div>
      <label htmlFor={id} className="text-sm leading-none cursor-pointer flex-1 text-slate-700 font-medium py-1 flex items-center">
        {showBrandLogo && logoUrl && (
          <div className="w-4 h-4 mr-2 flex-shrink-0 overflow-hidden">
            <Image src={logoUrl} alt={label} className="w-full h-full object-contain" width={16} height={16} />
          </div>
        )}
        {label}
      </label>
    </div>
  );
}