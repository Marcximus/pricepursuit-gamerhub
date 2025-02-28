
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Statistics</CardTitle>
        <CardDescription>No data available</CardDescription>
      </CardHeader>
    </Card>
  );
}
