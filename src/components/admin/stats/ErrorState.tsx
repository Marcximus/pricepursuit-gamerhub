
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface ErrorStateProps {
  message: string;
  error?: Error | string;
}

export function ErrorState({ message, error }: ErrorStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Statistics</CardTitle>
        <CardDescription>Error loading statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-destructive">{message}</div>
        {error && (
          <div className="mt-2 text-sm text-muted-foreground">
            {typeof error === 'string' ? error : error.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
