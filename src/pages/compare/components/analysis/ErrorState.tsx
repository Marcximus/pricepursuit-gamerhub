
import React from "react";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
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
  );
};

export default ErrorState;
