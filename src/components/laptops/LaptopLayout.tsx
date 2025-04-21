
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";
type LaptopLayoutProps = {
  filters: ReactNode;
  toolbar: ReactNode;
  content: ReactNode;
};
export function LaptopLayout({
  filters,
  toolbar,
  content
}: LaptopLayoutProps) {
  return <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-80 flex-shrink-0">
        <div className="sticky top-20">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardContent className="p-0">
              {filters}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="w-full sticky top-20 backdrop-blur-sm z-20 pb-4 transform-gpu bg-transparent">
          {toolbar}
        </div>
        <div className="relative z-10">
          {content}
        </div>
      </div>
    </div>;
}
