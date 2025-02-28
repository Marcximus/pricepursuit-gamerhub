
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Statistics</CardTitle>
        <CardDescription>Error loading statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-destructive">{error}</div>
      </CardContent>
    </Card>
  );
}
