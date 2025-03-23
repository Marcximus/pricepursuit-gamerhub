
import React from "react";

interface SpecificationValueProps {
  value: string;
  comparison?: 'better' | 'worse' | 'equal' | 'unknown';
}

const SpecificationValue: React.FC<SpecificationValueProps> = ({ value, comparison }) => {
  // Function to determine the CSS class for the value based on comparison
  const getValueClass = () => {
    if (comparison === 'better') return 'text-green-600 font-medium';
    if (comparison === 'worse') return 'text-red-500';
    return '';
  };
  
  return (
    <div className={`col-span-2 ${getValueClass()}`}>
      {value || 'Not available'}
    </div>
  );
};

export default SpecificationValue;
