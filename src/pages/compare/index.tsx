
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import ComparisonDataProvider from "./components/ComparisonDataProvider";
import ComparisonLayout from "./components/ComparisonLayout";

const ComparePage = () => {
  const { clearComparison } = useComparison();
  const navigate = useNavigate();
  
  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const handleGoBack = () => {
    navigate('/');
  };
  
  const handleClearAndGoBack = () => {
    clearComparison();
    navigate('/');
  };
  
  return (
    <ComparisonDataProvider>
      {({ isLoading, error, comparisonResult, laptopLeft, laptopRight, hasSelectedLaptops }) => (
        <ComparisonLayout
          handleGoBack={handleGoBack}
          handleClearAndGoBack={handleClearAndGoBack}
          isLoading={isLoading}
          error={error}
          comparisonResult={comparisonResult}
          laptopLeft={laptopLeft}
          laptopRight={laptopRight}
          hasSelectedLaptops={hasSelectedLaptops}
        />
      )}
    </ComparisonDataProvider>
  );
};

export default ComparePage;
