
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Laptop } from "lucide-react";

interface NoLaptopsSelectedProps {
  handleGoBack: () => void;
}

const NoLaptopsSelected: React.FC<NoLaptopsSelectedProps> = ({ handleGoBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <Card className="max-w-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <Laptop size={64} className="text-muted-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">No Laptops Selected</h1>
        
        <p className="mb-6 text-muted-foreground">
          Please select two laptops to compare from the laptop search page.
        </p>
        
        <Button 
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Go to Laptop Search
        </Button>
      </Card>
    </div>
  );
};

export default NoLaptopsSelected;
