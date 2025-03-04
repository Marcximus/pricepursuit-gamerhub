
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Award, Check, ChevronsUp, ChevronsDown, CircleX } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

type ComparisonResult = {
  winner: 'left' | 'right' | 'tie';
  analysis: string;
  advantages: {
    left: string[];
    right: string[];
  };
  recommendation: string;
  valueForMoney: {
    left: string;
    right: string;
  };
};

const ComparePage = () => {
  const { selectedLaptops, clearComparison } = useComparison();
  const navigate = useNavigate();
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Define the laptops for easier reference
  const laptopLeft = selectedLaptops[0];
  const laptopRight = selectedLaptops[1];
  
  useEffect(() => {
    // Redirect if we don't have exactly 2 laptops
    if (selectedLaptops.length !== 2) {
      navigate('/');
      return;
    }
    
    const fetchComparison = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.functions.invoke('compare-laptops', {
          body: { 
            laptopLeft: {
              id: laptopLeft.id,
              brand: laptopLeft.brand,
              model: laptopLeft.model || '',
              title: laptopLeft.title || '',
              processor: laptopLeft.processor || '',
              ram: laptopLeft.ram || '',
              storage: laptopLeft.storage || '',
              graphics: laptopLeft.graphics || '',
              screen_size: laptopLeft.screen_size || '',
              screen_resolution: laptopLeft.screen_resolution || '',
              price: laptopLeft.current_price || 0,
              rating: laptopLeft.rating || 0,
              rating_count: laptopLeft.rating_count || 0
            },
            laptopRight: {
              id: laptopRight.id,
              brand: laptopRight.brand,
              model: laptopRight.model || '',
              title: laptopRight.title || '',
              processor: laptopRight.processor || '',
              ram: laptopRight.ram || '',
              storage: laptopRight.storage || '',
              graphics: laptopRight.graphics || '',
              screen_size: laptopRight.screen_size || '',
              screen_resolution: laptopRight.screen_resolution || '',
              price: laptopRight.current_price || 0,
              rating: laptopRight.rating || 0,
              rating_count: laptopRight.rating_count || 0
            }
          }
        });
        
        if (error) throw error;
        
        setComparisonResult(data);
      } catch (err) {
        console.error('Error fetching comparison:', err);
        setError('Failed to compare laptops. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComparison();
  }, [selectedLaptops, navigate]);
  
  const handleGoBack = () => {
    navigate('/');
  };
  
  const handleClearAndGoBack = () => {
    clearComparison();
    navigate('/');
  };
  
  // Helper to format prices
  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };
  
  // Define comparison sections
  const comparisonSections = [
    {
      title: 'Brand & Model',
      leftValue: `${laptopLeft?.brand || 'N/A'} ${laptopLeft?.model || ''}`,
      rightValue: `${laptopRight?.brand || 'N/A'} ${laptopRight?.model || ''}`,
    },
    {
      title: 'Processor',
      leftValue: laptopLeft?.processor || 'Not Specified',
      rightValue: laptopRight?.processor || 'Not Specified',
      compare: (a: string, b: string) => {
        // Simple keyword-based comparison for processors
        const keywords = ['i9', 'i7', 'i5', 'i3', 'Ryzen 9', 'Ryzen 7', 'Ryzen 5', 'Ryzen 3', 'M3', 'M2', 'M1'];
        
        for (const keyword of keywords) {
          const aHas = a.includes(keyword);
          const bHas = b.includes(keyword);
          
          if (aHas && !bHas) return 'better';
          if (!aHas && bHas) return 'worse';
          if (aHas && bHas) return 'equal';
        }
        
        return 'unknown';
      }
    },
    {
      title: 'RAM',
      leftValue: laptopLeft?.ram || 'Not Specified',
      rightValue: laptopRight?.ram || 'Not Specified',
      compare: (a: string, b: string) => {
        // Extract RAM size for comparison
        const aMatch = a.match(/(\d+)\s*GB/i);
        const bMatch = b.match(/(\d+)\s*GB/i);
        
        if (aMatch && bMatch) {
          const aSize = parseInt(aMatch[1], 10);
          const bSize = parseInt(bMatch[1], 10);
          
          if (aSize > bSize) return 'better';
          if (aSize < bSize) return 'worse';
          return 'equal';
        }
        
        return 'unknown';
      }
    },
    {
      title: 'Storage',
      leftValue: laptopLeft?.storage || 'Not Specified',
      rightValue: laptopRight?.storage || 'Not Specified',
      compare: (a: string, b: string) => {
        // Convert TB to GB for comparison
        const convertToGB = (value: string) => {
          const tbMatch = value.match(/(\d+)\s*TB/i);
          if (tbMatch) return parseInt(tbMatch[1], 10) * 1000;
          
          const gbMatch = value.match(/(\d+)\s*GB/i);
          if (gbMatch) return parseInt(gbMatch[1], 10);
          
          return 0;
        };
        
        const aSize = convertToGB(a);
        const bSize = convertToGB(b);
        
        if (aSize > bSize) return 'better';
        if (aSize < bSize) return 'worse';
        return 'equal';
      }
    },
    {
      title: 'Graphics',
      leftValue: laptopLeft?.graphics || 'Not Specified',
      rightValue: laptopRight?.graphics || 'Not Specified',
    },
    {
      title: 'Display',
      leftValue: `${laptopLeft?.screen_size || 'N/A'} ${laptopLeft?.screen_resolution ? `(${laptopLeft.screen_resolution})` : ''}`,
      rightValue: `${laptopRight?.screen_size || 'N/A'} ${laptopRight?.screen_resolution ? `(${laptopRight.screen_resolution})` : ''}`,
    },
    {
      title: 'Price',
      leftValue: formatPrice(laptopLeft?.current_price),
      rightValue: formatPrice(laptopRight?.current_price),
      compare: (a: string, b: string) => {
        // Lower price is better
        const aPrice = parseFloat(a.replace('$', ''));
        const bPrice = parseFloat(b.replace('$', ''));
        
        if (aPrice < bPrice) return 'better';
        if (aPrice > bPrice) return 'worse';
        return 'equal';
      }
    },
    {
      title: 'Rating',
      leftValue: laptopLeft?.rating ? `${laptopLeft.rating}/5 (${laptopLeft.rating_count} reviews)` : 'No ratings',
      rightValue: laptopRight?.rating ? `${laptopRight.rating}/5 (${laptopRight.rating_count} reviews)` : 'No ratings',
      compare: (a: string, b: string) => {
        const aMatch = a.match(/(\d+\.\d+)\/5/);
        const bMatch = b.match(/(\d+\.\d+)\/5/);
        
        if (aMatch && bMatch) {
          const aRating = parseFloat(aMatch[1]);
          const bRating = parseFloat(bMatch[1]);
          
          if (aRating > bRating) return 'better';
          if (aRating < bRating) return 'worse';
          return 'equal';
        }
        
        return 'unknown';
      }
    },
  ];
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Laptops
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleClearAndGoBack}
            >
              Clear Comparison
            </Button>
          </div>
          
          <h1 className="text-2xl font-bold mb-6">Laptop Comparison</h1>
          
          {/* Product Header Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <Card className="p-6 flex flex-col items-center">
              <div className="w-48 h-48 flex items-center justify-center mb-4">
                <img 
                  src={laptopLeft?.image_url || '/placeholder.svg'} 
                  alt={laptopLeft?.title || 'Left laptop'} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <h2 className="text-lg font-semibold text-center">
                {laptopLeft?.title || 'Laptop 1'}
              </h2>
              <div className="mt-2 text-xl font-bold text-center">
                {formatPrice(laptopLeft?.current_price)}
              </div>
            </Card>
            
            <Card className="p-6 flex flex-col items-center">
              <div className="w-48 h-48 flex items-center justify-center mb-4">
                <img 
                  src={laptopRight?.image_url || '/placeholder.svg'} 
                  alt={laptopRight?.title || 'Right laptop'} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <h2 className="text-lg font-semibold text-center">
                {laptopRight?.title || 'Laptop 2'}
              </h2>
              <div className="mt-2 text-xl font-bold text-center">
                {formatPrice(laptopRight?.current_price)}
              </div>
            </Card>
          </div>
          
          {/* AI Analysis Section */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-primary/10 p-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">AI Analysis</h2>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : error ? (
                <div className="text-center p-4">
                  <CircleX className="w-12 h-12 text-destructive mx-auto mb-2" />
                  <p className="text-destructive">{error}</p>
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : comparisonResult ? (
                <div className="space-y-6">
                  {/* Winner Badge */}
                  <div className="flex justify-center mb-6">
                    {comparisonResult.winner !== 'tie' && (
                      <Badge variant="default" className="text-lg px-4 py-2 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Winner: {comparisonResult.winner === 'left' 
                          ? laptopLeft?.brand + ' ' + (laptopLeft?.model || '')
                          : laptopRight?.brand + ' ' + (laptopRight?.model || '')}
                      </Badge>
                    )}
                    
                    {comparisonResult.winner === 'tie' && (
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        It's a tie! Both laptops have their strengths.
                      </Badge>
                    )}
                  </div>
                  
                  {/* Analysis Text */}
                  <div className="text-base leading-relaxed">
                    <p>{comparisonResult.analysis}</p>
                  </div>
                  
                  {/* Advantages */}
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="font-semibold mb-3">
                        {laptopLeft?.brand} {laptopLeft?.model} Advantages
                      </h3>
                      <ul className="space-y-2">
                        {comparisonResult.advantages.left.map((advantage, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <span>{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">
                        {laptopRight?.brand} {laptopRight?.model} Advantages
                      </h3>
                      <ul className="space-y-2">
                        {comparisonResult.advantages.right.map((advantage, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <span>{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Value for Money */}
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="font-semibold mb-2">Value for Money</h3>
                      <p>{comparisonResult.valueForMoney.left}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Value for Money</h3>
                      <p>{comparisonResult.valueForMoney.right}</p>
                    </div>
                  </div>
                  
                  {/* Recommendation */}
                  <div className="bg-slate-50 p-4 rounded-md mt-6">
                    <h3 className="font-semibold mb-2">Recommendation</h3>
                    <p>{comparisonResult.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">Analyzing laptops...</p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Detailed Specs Comparison */}
          <Card>
            <div className="bg-muted p-4">
              <h2 className="text-lg font-semibold">Detailed Specifications</h2>
            </div>
            
            <div className="divide-y">
              {comparisonSections.map((section, index) => {
                // Determine better/worse indicators if compare function exists
                let leftStatus = 'equal';
                let rightStatus = 'equal';
                
                if (section.compare) {
                  const result = section.compare(section.leftValue, section.rightValue);
                  leftStatus = result;
                  rightStatus = result === 'better' ? 'worse' : result === 'worse' ? 'better' : result;
                }
                
                return (
                  <div key={index} className="grid grid-cols-7 px-4 py-3">
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {leftStatus === 'better' && <ChevronsUp className="w-4 h-4 text-green-600" />}
                        {leftStatus === 'worse' && <ChevronsDown className="w-4 h-4 text-red-600" />}
                        <span>{section.leftValue}</span>
                      </div>
                    </div>
                    
                    <div className="col-span-3 flex items-center justify-center">
                      <span className="text-muted-foreground font-medium">{section.title}</span>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {rightStatus === 'better' && <ChevronsUp className="w-4 h-4 text-green-600" />}
                        {rightStatus === 'worse' && <ChevronsDown className="w-4 h-4 text-red-600" />}
                        <span>{section.rightValue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ComparePage;
