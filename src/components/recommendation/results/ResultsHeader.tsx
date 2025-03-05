
import React from 'react';

export const ResultsHeader: React.FC = () => {
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-2">Your Personalized Recommendations</h1>
      <p className="text-center text-gray-600 mb-8">
        Based on your preferences, here are the best laptops for you
      </p>
    </>
  );
};
