
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendationQuiz from '../components/recommendation/RecommendationQuiz';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Laptop } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import LaptopParticles from '../components/recommendation/LaptopParticles';
const Recommend = () => {
  const navigate = useNavigate();
  const [showingResults, setShowingResults] = React.useState(false);
  const handleResultsDisplayChange = (isShowingResults: boolean) => {
    setShowingResults(isShowingResults);
  };
  return <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 py-4">
          <Card className="bg-white/80 shadow-md border-0 relative overflow-hidden rounded-2xl">
            <div className="relative">
              <LaptopParticles />
              <div className="relative pt-4 z-10 bg-gradient-to-b from-transparent via-white/90 to-white/90">
                <div className="px-4 md:px-8">
                  <Button variant="outline" onClick={() => navigate('/')} className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all duration-200">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Laptops
                  </Button>
                </div>
                
                {!showingResults ? <>
                    <div className="flex justify-center mb-1">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Laptop className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Find Your Perfect Laptop</h1>
                    <p className="text-center text-gray-600 mb-6 max-w-lg mx-auto">Answer a few questions and we'll recommend the best laptops for you</p>
                  </> : <div className="pb-4">
                    {/* Empty div to maintain spacing - the ResultsHeader component in RecommendationResults will display the title */}
                  </div>}
              </div>
            </div>
            <CardContent className="pt-0 px-4 md:px-8 pb-10">
              <RecommendationQuiz onResultsDisplayChange={handleResultsDisplayChange} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>;
};
export default Recommend;
