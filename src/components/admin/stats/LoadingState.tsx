
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading latest statistics..." }: LoadingStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Statistics</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}
