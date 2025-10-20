
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendationQuiz from '../components/recommendation/RecommendationQuiz';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Laptop } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import LaptopParticles from '../components/recommendation/LaptopParticles';
import { useIsMobile } from '@/hooks/use-mobile';
import RecentFinds from '../components/recommendation/RecentFinds';

const Recommend = () => {
  const navigate = useNavigate();
  const [showingResults, setShowingResults] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const isMobile = useIsMobile();
  
  const handleResultsDisplayChange = (isShowingResults: boolean) => {
    setShowingResults(isShowingResults);
  };
  
  const handleProcessingChange = (isProcessing: boolean) => {
    setIsProcessing(isProcessing);
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="pt-16 pb-20" role="main">
        <section className={`container mx-auto ${isMobile ? 'px-4' : 'px-6'} py-4`}>
          <Card className="bg-transparent shadow-none border-0 relative overflow-hidden rounded-2xl">
            <div className="relative">
              {!isMobile && <LaptopParticles />}
              <div className="relative pt-4 z-10">
                <div className={`${isMobile ? 'px-0' : 'px-4 md:px-8'}`}>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')} 
                    className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all duration-200 ${isMobile ? 'w-full justify-center' : ''}`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Laptops
                  </Button>
                </div>
                
                {!showingResults && !isProcessing ? (
                  <>
                    <div className="flex justify-center mb-1">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Laptop className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <h1 className={`text-2xl ${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-center mb-2 text-gray-800`}>
                      Find Your Perfect Laptop
                    </h1>
                    <p className="text-center text-gray-600 mb-6 max-w-lg mx-auto px-4">
                      Answer a few questions and we'll recommend the best laptops for you
                    </p>
                  </>
                ) : (
                  <div className="pb-4" />
                )}
              </div>
            </div>
            <CardContent className={`pt-0 ${isMobile ? 'px-0' : 'px-4 md:px-8'} pb-10`}>
              <RecommendationQuiz 
                onResultsDisplayChange={handleResultsDisplayChange} 
                onProcessingChange={handleProcessingChange}
              />
            </CardContent>
          </Card>
          
          {/* Show Recent Finds when not in the middle of taking the quiz */}
          {!isProcessing && (
            <RecentFinds />
          )}
        </section>
      </main>
    </div>
  );
};

export default Recommend;
