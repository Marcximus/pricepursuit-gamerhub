
import React from "react";
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import ComparisonDataProvider from "./components/ComparisonDataProvider";
import ComparisonLayout from "./components/ComparisonLayout";

const ComparePage = () => {
  const { clearComparison } = useComparison();
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/');
  };
  
  const handleClearAndGoBack = () => {
    clearComparison();
    navigate('/');
  };
  
  return (
    <ComparisonDataProvider>
      {({ 
        isLoading, 
        error, 
        comparisonResult, 
        laptopLeft, 
        laptopRight, 
        hasSelectedLaptops,
        enhancedSpecsLeft,
        enhancedSpecsRight
      }) => (
        <ComparisonLayout
          handleGoBack={handleGoBack}
          handleClearAndGoBack={handleClearAndGoBack}
          isLoading={isLoading}
          error={error}
          comparisonResult={comparisonResult}
          laptopLeft={laptopLeft}
          laptopRight={laptopRight}
          hasSelectedLaptops={hasSelectedLaptops}
          enhancedSpecsLeft={enhancedSpecsLeft}
          enhancedSpecsRight={enhancedSpecsRight}
        />
      )}
    </ComparisonDataProvider>
  );
};

export default ComparePage;
