
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import SpecificationTitle from './SpecificationTitle';
import SpecificationValue from './SpecificationValue';

export interface SpecRow {
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
  const isMobile = useIsMobile();

  return (
    <div className="divide-y">
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-7'} p-4 bg-slate-50 font-medium`}>
        {isMobile ? (
          <div className="text-center">Specifications Comparison</div>
        ) : (
          <>
            <div className="col-span-3 text-left">Specification</div>
            <div className="col-span-2 text-left text-sky-700">
              {leftLaptopTitle}
            </div>
            <div className="col-span-2 text-left text-amber-700">
              {rightLaptopTitle}
            </div>
          </>
        )}
      </div>
      
      {specRows.map((specRow, index) => (
        <div key={index} className={`
          ${isMobile ? 'flex flex-col space-y-2' : 'grid grid-cols-7'} 
          p-4 hover:bg-gray-50 transition-colors
        `}>
          {isMobile ? (
            <>
              <SpecificationTitle title={specRow.title} />
              <div className="flex justify-between gap-4 mt-2">
                <div className="flex-1">
                  <div className="text-sm text-sky-700 mb-1">{leftLaptopTitle}</div>
                  <SpecificationValue 
                    value={specRow.leftValue} 
                    comparison={specRow.compare ? specRow.compare(specRow.leftValue, specRow.rightValue) : undefined} 
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-amber-700 mb-1">{rightLaptopTitle}</div>
                  <SpecificationValue 
                    value={specRow.rightValue} 
                    comparison={specRow.compare ? specRow.compare(specRow.rightValue, specRow.leftValue) : undefined} 
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <SpecificationTitle title={specRow.title} />
              <SpecificationValue 
                value={specRow.leftValue} 
                comparison={specRow.compare ? specRow.compare(specRow.leftValue, specRow.rightValue) : undefined} 
              />
              <SpecificationValue 
                value={specRow.rightValue} 
                comparison={specRow.compare ? specRow.compare(specRow.rightValue, specRow.leftValue) : undefined} 
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default SpecificationsTable;
