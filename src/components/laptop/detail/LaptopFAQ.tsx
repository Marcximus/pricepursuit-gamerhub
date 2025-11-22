import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Product } from '@/types/product';

interface LaptopFAQProps {
  product: Product;
}

export function LaptopFAQ({ product }: LaptopFAQProps) {
  // Generate FAQs based on product specs
  const faqs = [];

  // Gaming FAQ if has dedicated graphics
  if (product.graphics && !product.graphics.toLowerCase().includes('integrated')) {
    faqs.push({
      question: `Can the ${product.brand} ${product.model || 'laptop'} run modern games?`,
      answer: `Yes, this laptop features ${product.graphics}, which can handle most modern games at medium to high settings. The ${product.processor} paired with ${product.ram} ensures smooth gaming performance.`,
    });
  }

  // Video editing FAQ if has good specs
  if (product.ram && (product.ram.includes('16GB') || product.ram.includes('32GB'))) {
    faqs.push({
      question: `Is this laptop good for video editing?`,
      answer: `With ${product.ram} and ${product.processor}, this laptop is well-suited for video editing tasks. The ${product.storage} provides ample space for project files and footage.`,
    });
  }

  // Battery FAQ
  if (product.battery_life) {
    faqs.push({
      question: `What is the battery life of this laptop?`,
      answer: `The laptop offers approximately ${product.battery_life} of battery life under typical usage conditions. Actual battery life may vary based on settings and usage patterns.`,
    });
  }

  // Storage FAQ
  if (product.storage) {
    faqs.push({
      question: `Can I upgrade the storage on this laptop?`,
      answer: `This laptop comes with ${product.storage}. Many modern laptops support storage upgrades via M.2 slots, but it's best to check the specific model's documentation or consult with the manufacturer for upgrade options.`,
    });
  }

  // Display FAQ
  if (product.screen_resolution) {
    faqs.push({
      question: `What is the display quality like?`,
      answer: `The laptop features a ${product.screen_size} display with ${product.screen_resolution} resolution, providing sharp and clear visuals for both work and entertainment.`,
    });
  }

  // Weight/Portability FAQ
  if (product.weight) {
    faqs.push({
      question: `Is this laptop portable?`,
      answer: `At ${product.weight}, this laptop ${
        parseFloat(product.weight) < 4 ? 'is quite portable and easy to carry' : 'is more suited for desk use but still movable when needed'
      }.`,
    });
  }

  // Generic FAQs
  faqs.push(
    {
      question: `What's included in the box?`,
      answer: `Typically, the package includes the laptop, AC adapter, power cord, and user documentation. Some models may include additional accessories.`,
    },
    {
      question: `Does this laptop come with a warranty?`,
      answer: `Most laptops come with a manufacturer's warranty. Check the product listing on Amazon or the manufacturer's website for specific warranty details and coverage information.`,
    }
  );

  // Create FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="mb-8 lg:mb-10">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 lg:mb-6">Frequently Asked Questions</h2>
      
      <Accordion type="single" collapsible className="w-full space-y-3">
        {faqs.map((faq, idx) => (
          <AccordionItem
            key={idx}
            value={`faq-${idx}`}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 text-left">
              <span className="font-semibold text-foreground">{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
