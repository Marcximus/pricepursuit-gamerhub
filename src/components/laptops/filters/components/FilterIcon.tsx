
import React from "react";
import { Cpu, HardDrive, Monitor, Box, Laptop, Layers, Microchip } from "lucide-react";

type FilterIconProps = {
  iconType: string;
};

export function FilterIcon({ iconType }: FilterIconProps) {
  switch (iconType.toLowerCase()) {
    case 'cpu':
      return <Cpu className="h-4 w-4 text-slate-600" />;
    case 'memory':
      return <Layers className="h-4 w-4 text-slate-600" />;
    case 'hard-drive':
      return <HardDrive className="h-4 w-4 text-slate-600" />;
    case 'gpu':
      return <Microchip className="h-4 w-4 text-slate-600" />;
    case 'monitor':
      return <Monitor className="h-4 w-4 text-slate-600" />;
    case 'brand':
      return <Laptop className="h-4 w-4 text-slate-600" />;
    default:
      return <Box className="h-4 w-4 text-slate-600" />;
  }
}
