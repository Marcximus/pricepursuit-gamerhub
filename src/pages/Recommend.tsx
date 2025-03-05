
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendationQuiz from '../components/recommendation/RecommendationQuiz';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import LaptopParticles from '../components/recommendation/LaptopParticles';

const Recommend = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center mb-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Laptops
            </Button>
          </div>

          <Card className="bg-white shadow-md border-0 relative overflow-hidden">
            <div className="relative">
              <LaptopParticles />
              <div className="relative pt-6 z-10 bg-gradient-to-b from-transparent via-white to-white">
                <h1 className="text-3xl font-bold text-center mb-2">Find Your Perfect Laptop</h1>
                <p className="text-center text-gray-600 mb-6">
                  Answer a few questions and we'll recommend the best laptops for your needs
                </p>
              </div>
            </div>
            <CardContent className="pt-0">
              <RecommendationQuiz />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Recommend;
