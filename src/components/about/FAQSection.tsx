
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQSection = () => {
  const faqs = [
    {
      question: "How does Laptop Hunter find the best deals?",
      answer: "We continuously track prices across major retailers and use advanced algorithms to identify price drops, sales, and the best overall value. Our system updates regularly to ensure you always have access to the most current pricing information."
    },
    {
      question: "Are your laptop recommendations biased?",
      answer: "No, our recommendations are completely unbiased. While we may earn affiliate commissions on some purchases, our ranking algorithm is based purely on specs, performance, value, and user reviews. We never promote specific brands or models based on commission rates."
    },
    {
      question: "How often is your laptop database updated?",
      answer: "Our database is updated daily with new models, price changes, and spec corrections. This ensures you're always seeing the most current and accurate information when making your laptop purchase decision."
    },
    {
      question: "Can I trust your laptop reviews?",
      answer: "Absolutely! Our laptop assessments incorporate thousands of verified user reviews along with expert technical analysis. We aggregate review data from multiple sources to provide a comprehensive and balanced evaluation of each laptop."
    },
    {
      question: "How do I use your laptop comparison tool?",
      answer: "Simply browse our laptop selection and click the 'Compare' button on any laptops you're interested in. You can select up to three laptops to compare side-by-side, with detailed breakdowns of specs, performance, value, and user satisfaction."
    },
    {
      question: "What if I need help choosing a laptop?",
      answer: "We offer a personalized recommendation tool that asks about your specific needs, usage, and budget. Based on your answers, we'll suggest the most suitable laptops for your requirements. You can also reach out to our community forum for advice from tech enthusiasts."
    }
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-8 mb-16 mt-16">
      <div className="flex items-center justify-center mb-8">
        <HelpCircle className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions 🤔</h2>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-medium text-gray-800 hover:text-gaming-600">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQSection;
