
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendationQuiz from '../components/recommendation/RecommendationQuiz';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const Recommend = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Laptops</span>
        </button>
      </div>

      <Card className="bg-white shadow-md border-0">
        <CardContent className="pt-6">
          <h1 className="text-3xl font-bold text-center mb-6">Find Your Perfect Laptop</h1>
          <p className="text-center text-gray-600 mb-8">
            Answer a few questions and we'll recommend the best laptops for your needs
          </p>
          <RecommendationQuiz />
        </CardContent>
      </Card>
    </div>
  );
};

export default Recommend;
