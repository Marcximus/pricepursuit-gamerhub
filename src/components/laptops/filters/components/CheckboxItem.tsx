
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
      // All other brands use Others.png
      'ist computers': 'Others.png',
      'AimCare': 'Others.png',
      'ANMESC': 'Others.png',
      'ANPCOWER': 'Others.png',
      'ANTEMPER': 'Others.png',
      'AOC': 'Others.png',
      'ApoloMedia': 'Others.png',
      'ApoloSign': 'Others.png',
      'Auusda': 'Others.png',
      'Basrdis': 'Others.png',
      'BINHENGLON': 'Others.png',
      'BiTECOOL': 'Others.png',
      'Blackview': 'Others.png',
      'BLUEING': 'Others.png',
      'BTDD': 'Others.png',
      'Buosha': 'Others.png',
      'bvate': 'Others.png',
      'Carlisle FoodService Products': 'Others.png',
      'CGZZ': 'Others.png',
      'CHUWI': 'Others.png',
      'Coolby': 'Others.png',
      'Core Innovations': 'Others.png',
      'DERE': 'Others.png',
      'DUNHOO': 'Others.png',
      'dynabook': 'Others.png',
      'ECOHERO': 'Others.png',
      'Empowered PC': 'Others.png',
      'EXCaliberPC': 'Others.png',
      'EYY': 'Others.png',
      'FCHJJ': 'Others.png',
      'Fsjun': 'Others.png',
      'FUNYET': 'Others.png',
      'FURESTUR': 'Others.png',
      'Gateway': 'Others.png',
      'Generic': 'Others.png',
      'Gezoon': 'Others.png',
      'Gina Joyfurno': 'Others.png',
      'H L Data Storage': 'Others.png',
      'HP Sauce': 'Others.png',
      'Huawei': 'Others.png',
      'INHONLAP': 'Others.png',
      'KeeUiU': 'Others.png',
      'KUU': 'Others.png',
      'LG Electronics': 'Others.png',
      'Logitech G': 'Others.png',
      'LXU': 'Others.png',
      'Machenike': 'Others.png',
      'MALLRACE': 'Others.png',
      'MARGOLAI': 'Others.png',
      'Maxsignage': 'Others.png',
      'ME2 MichaelElectronics2': 'Others.png',
      'MELIUNA': 'Others.png',
      'Morostron': 'Others.png',
      'Naclud': 'Others.png',
      'NAIKLULU': 'Others.png',
      'NEOBIHIER': 'Others.png',
      'NIAKUN': 'Others.png',
      'Nmybwo': 'Others.png',
      'Oemgenuine': 'Others.png',
      'OTVOC': 'Others.png',
      'Pryloxen': 'Others.png',
      'RIANIFEL': 'Others.png',
      'ROOFULL': 'Others.png',
      'Ruchonin': 'Others.png',
      'Rumtuk': 'Others.png',
      'SAINTDISE': 'Others.png',
      'Samsung Electronics': 'Others.png',
      'SGIN': 'Others.png',
      'Sony': 'Others.png',
      'Svikou': 'Others.png',
      'SZTPSLS': 'Others.png',
      'TPV': 'Others.png',
      'Trygood': 'Others.png',
      'UOWAMOU': 'Others.png',
      'Vaio': 'Others.png',
      'VAIO': 'Others.png',
      'WIPEMIK': 'Others.png',
      'Xiaomi': 'Others.png',
      'XINHENGTAI': 'Others.png',
      'XYPLOXZ': 'Others.png',
      'Ymawetia': 'Others.png',
      'ZENAERO': 'Others.png',
      'Zuleisy': 'Others.png',
      'ZWYING': 'Others.png'
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
        className="!h-3 !w-3 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 border-slate-300"
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
