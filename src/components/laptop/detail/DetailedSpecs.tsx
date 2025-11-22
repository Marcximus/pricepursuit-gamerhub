import { Cpu, HardDrive, Monitor, Zap, Weight, Battery } from 'lucide-react';
import { Card } from "@/components/ui/card";
import type { Product } from '@/types/product';

interface DetailedSpecsProps {
  product: Product;
}

export function DetailedSpecs({ product }: DetailedSpecsProps) {
  const specs = [
    {
      category: 'Performance',
      icon: Zap,
      items: [
        { label: 'Processor', value: product.processor },
        { label: 'Processor Score', value: product.processor_score ? `${product.processor_score.toLocaleString()} pts` : null },
        { label: 'Graphics', value: product.graphics },
        { label: 'Benchmark Score', value: product.benchmark_score ? `${product.benchmark_score.toLocaleString()} pts` : null },
        { label: 'RAM', value: product.ram },
      ],
    },
    {
      category: 'Display',
      icon: Monitor,
      items: [
        { label: 'Screen Size', value: product.screen_size },
        { label: 'Resolution', value: product.screen_resolution },
      ],
    },
    {
      category: 'Storage',
      icon: HardDrive,
      items: [
        { label: 'Type & Capacity', value: product.storage },
      ],
    },
    {
      category: 'Physical',
      icon: Weight,
      items: [
        { label: 'Weight', value: product.weight },
        { label: 'Battery Life', value: product.battery_life },
      ],
    },
  ];

  // Flatten all specs into a single array
  const allSpecs = specs.flatMap(section => 
    section.items
      .filter(item => item.value)
      .map(item => ({
        ...item,
        category: section.category,
        icon: section.icon
      }))
  );

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold text-foreground mb-6">Technical Specifications</h2>
      
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {allSpecs.map((spec, idx) => {
            const Icon = spec.icon;
            return (
              <div 
                key={idx} 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 md:col-span-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{spec.label}</span>
                </div>
                <div className="md:col-span-2 flex items-center">
                  <span className="font-semibold text-foreground">{spec.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
