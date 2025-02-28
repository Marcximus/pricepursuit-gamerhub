
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LoadingStateProps {
  message?: string;
  onRetry?: () => void;
}

export function LoadingState({ message = "Loading latest statistics...", onRetry }: LoadingStateProps) {
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  useEffect(() => {
    // After 10 seconds, show the timeout message
    const timeout = setTimeout(() => {
      setLoadingTooLong(true);
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Statistics</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        
        {loadingTooLong && (
          <div className="text-center mt-4">
            <p className="text-sm text-destructive mb-2">
              Loading is taking longer than expected. There might be an issue with the database connection.
            </p>
          </div>
        )}
      </CardContent>
      
      {loadingTooLong && onRetry && (
        <CardFooter className="flex justify-center pb-6">
          <Button onClick={onRetry} variant="outline">
            Retry Loading
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
