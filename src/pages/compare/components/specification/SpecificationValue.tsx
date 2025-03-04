
import React from "react";
import { ChevronsUp, ChevronsDown, ExternalLink } from "lucide-react";

interface SpecificationValueProps {
  value: string;
  status: 'better' | 'worse' | 'equal' | 'unknown';
  affiliateUrl: string;
  theme?: 'left' | 'right';
}

const SpecificationValue: React.FC<SpecificationValueProps> = ({ 
  value, 
  status, 
  affiliateUrl,
  theme = 'left'
}) => {
  const themeClass = theme === 'left' ? 'hover:text-sky-600' : 'hover:text-amber-600';
  
  return (
    <div className="col-span-2 text-left">
      <a 
        href={affiliateUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 ${themeClass} transition-colors group`}
      >
        {status === 'better' && <ChevronsUp className="w-4 h-4 text-green-600" />}
        {status === 'worse' && <ChevronsDown className="w-4 h-4 text-red-600" />}
        <span className={
          status === 'better' 
            ? 'text-green-700 font-medium' 
            : status === 'worse' 
              ? 'text-red-600 font-medium' 
              : ''
        }>{value}</span>
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
      </a>
    </div>
  );
};

export default SpecificationValue;
