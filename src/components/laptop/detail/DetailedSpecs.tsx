import { Cpu, HardDrive, Monitor, Zap, Weight, Battery, Wifi } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
      category: 'Physical Characteristics',
      icon: Weight,
      items: [
        { label: 'Weight', value: product.weight },
        { label: 'Battery Life', value: product.battery_life },
      ],
    },
  ];

  return (
    <section className="mb-8 lg:mb-10">
      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 lg:mb-6">Technical Specifications</h2>
      
      <Accordion type="multiple" className="w-full space-y-3">
        {specs.map((section, idx) => {
          const Icon = section.icon;
          const hasValidItems = section.items.some(item => item.value);
          
          if (!hasValidItems) return null;

          return (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg font-semibold text-foreground">{section.category}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3 pt-2">
                  {section.items.map((item, itemIdx) => (
                    item.value && (
                      <div key={itemIdx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">{item.value}</span>
                      </div>
                    )
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
