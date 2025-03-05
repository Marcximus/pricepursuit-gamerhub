
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Product } from "@/types/product";

interface ComparisonContextProps {
  selectedLaptops: Product[];
  addToComparison: (laptop: Product) => void;
  removeFromComparison: (laptopId: string) => void;
  clearComparison: () => void;
  isSelected: (laptopId: string) => boolean;
  canCompare: boolean;
}

const ComparisonContext = createContext<ComparisonContextProps | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedLaptops, setSelectedLaptops] = useState<Product[]>([]);
  
  const addToComparison = (laptop: Product) => {
    // Ensure laptop has an ID (use asin as fallback if needed)
    if (!laptop.id && laptop.asin) {
      laptop = { ...laptop, id: laptop.asin };
    }
    
    if (selectedLaptops.length < 2 && !isSelected(laptop.id)) {
      setSelectedLaptops([...selectedLaptops, laptop]);
    }
  };
  
  const removeFromComparison = (laptopId: string) => {
    setSelectedLaptops(selectedLaptops.filter(laptop => laptop.id !== laptopId));
  };
  
  const clearComparison = () => {
    setSelectedLaptops([]);
  };
  
  const isSelected = (laptopId: string) => {
    return selectedLaptops.some(laptop => laptop.id === laptopId);
  };
  
  const canCompare = selectedLaptops.length === 2;
  
  return (
    <ComparisonContext.Provider 
      value={{ 
        selectedLaptops, 
        addToComparison, 
        removeFromComparison, 
        clearComparison, 
        isSelected,
        canCompare
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  
  return context;
}
