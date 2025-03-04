
import React from "react";
import { Laptop, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const EmptyComparisonState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-8 text-center shadow-md">
      <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4">
        <div className="bg-primary/10 p-5 rounded-full mb-2">
          <Laptop className="h-14 w-14 text-primary" />
        </div>
        
        <h2 className="text-2xl font-semibold">No Laptops Selected</h2>
        
        <div className="text-muted-foreground max-w-xl mx-auto space-y-4">
          <p className="text-base">✨ No laptops have been selected yet. To compare laptops side by side - including prices, specs, and features - head over to our laptop catalog.</p>
          
          <p className="text-base">💻 Select any two laptops (whether you're looking for budget-friendly models or top-tier performers), then click the "Compare" button.</p>
          
          <p className="text-base">This way, you can quickly discover the best laptop deals and pick the perfect machine for your needs and budget.</p>
        </div>
        
        <Button 
          onClick={() => navigate('/')} 
          className="mt-2 flex items-center gap-2 py-2 px-6 text-base font-medium"
        >
          Browse Laptops <MoveRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyComparisonState;
