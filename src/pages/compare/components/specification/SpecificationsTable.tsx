
import React from 'react';
import { SpecificationTitle } from './SpecificationTitle';
import { SpecificationValue } from './SpecificationValue';

interface SpecRow {
  title: string;
  leftValue: string;
  rightValue: string;
  compare?: (a: string, b: string) => 'better' | 'worse' | 'equal' | 'unknown';
}

interface SpecificationsTableProps {
  specRows: SpecRow[];
  leftLaptopTitle: string;
  rightLaptopTitle: string;
}

const SpecificationsTable: React.FC<SpecificationsTableProps> = ({ 
  specRows, 
  leftLaptopTitle, 
  rightLaptopTitle 
}) => {
  return (
    <div className="divide-y">
      <div className="grid grid-cols-7 p-4 bg-slate-50 font-medium">
        <div className="col-span-3 text-left">Specification</div>
        <div className="col-span-2 text-left text-sky-700">
          {leftLaptopTitle}
        </div>
        <div className="col-span-2 text-left text-amber-700">
          {rightLaptopTitle}
        </div>
      </div>
      
      {specRows.map((specRow, index) => (
        <div key={index} className="grid grid-cols-7 p-4 hover:bg-gray-50 transition-colors">
          <SpecificationTitle title={specRow.title} />
          <SpecificationValue 
            value={specRow.leftValue} 
            comparison={specRow.compare ? specRow.compare(specRow.leftValue, specRow.rightValue) : undefined} 
          />
          <SpecificationValue 
            value={specRow.rightValue} 
            comparison={specRow.compare ? specRow.compare(specRow.rightValue, specRow.leftValue) : undefined} 
          />
        </div>
      ))}
    </div>
  );
};

export default SpecificationsTable;
