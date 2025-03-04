import React from "react";
import { Laptop, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
const EmptyComparisonState: React.FC = () => {
  const navigate = useNavigate();
  return <Card className="p-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-primary/10 p-4 rounded-full">
          <Laptop className="h-12 w-12 text-primary" />
        </div>
        
        <h2 className="text-xl font-semibold">No Laptops Selected</h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">No laptops have been selected yet. To compare laptops side by side - including prices, specs, and features - head over to our laptop catalog. Select any two laptops (whether you’re looking for budget-friendly models or top-tier performers), then click the “Compare” button. This way, you can quickly discover the best laptop deals and pick the perfect machine for your needs and budget.</p>
        
        <Button onClick={() => navigate('/')} className="mt-4 flex items-center gap-2">
          Browse Laptops <MoveRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>;
};
export default EmptyComparisonState;