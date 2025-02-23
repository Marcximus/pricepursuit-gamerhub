
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

type LaptopLayoutProps = {
  filters: ReactNode;
  toolbar: ReactNode;
  content: ReactNode;
};

export function LaptopLayout({ filters, toolbar, content }: LaptopLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-64 flex-shrink-0">
        <div className="sticky top-32">
          <Card className="shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              {filters}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="w-full sticky top-32 bg-gray-50 z-10 pb-4">
          {toolbar}
        </div>
        <div className="relative z-0">
          {content}
        </div>
      </div>
    </div>
  );
}
