
import React from 'react';
import Navigation from '@/components/Navigation';

const Blog = () => {
  return (
    <div>
      <Navigation />
      <div className="pt-32 px-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Laptop Hunter Blog</h1>
        <p className="text-lg text-gray-700 mb-4">
          Welcome to our blog! This page is currently under development. 
          Soon, we'll be sharing expert reviews, buying guides, and tips to help you 
          find the perfect laptop for your needs.
        </p>
        <div className="grid gap-8 mt-12">
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Coming Soon: Top Gaming Laptops of 2025</h2>
            <p className="text-gray-600">
              Our experts are testing the latest gaming laptops to bring you comprehensive 
              reviews and comparisons.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Coming Soon: Budget Laptops That Don't Compromise</h2>
            <p className="text-gray-600">
              Find out which affordable laptops offer the best value without sacrificing 
              performance or build quality.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Coming Soon: Apple vs Windows: Which Should You Choose?</h2>
            <p className="text-gray-600">
              A detailed comparison of macOS and Windows operating systems to help you 
              decide which ecosystem is right for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
