
import React from 'react';
import { HelpCircle, Laptop, Search, DollarSign, Zap, ShieldCheck, Wrench, Tag, BarChart } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQSection = () => {
  const faqs = [
    // General Questions
    {
      question: "How does Laptop Hunter find the best deals?",
      answer: "We continuously track prices across major retailers and use advanced algorithms to identify price drops, sales, and the best overall value. Our system updates regularly to ensure you always have access to the most current pricing information for all laptop brands including Dell, HP, Lenovo, Apple, ASUS, and more."
    },
    {
      question: "Are your laptop recommendations biased?",
      answer: "No, our recommendations are completely unbiased. While we may earn affiliate commissions on some purchases, our ranking algorithm is based purely on specs, performance, value, and user reviews. We never promote specific brands or models based on commission rates."
    },
    
    // Brand Specific Questions
    {
      question: "Which is better for students: MacBook Air or Dell XPS 13?",
      answer: "Both are excellent choices for students. The MacBook Air with M2 chip offers exceptional battery life (up to 18 hours) and seamless integration with other Apple devices, making it perfect for Apple ecosystem users. The Dell XPS 13 provides more ports, Windows compatibility for specialized software, and often better value. For most students, the MacBook Air is better for creative work and battery life, while the XPS 13 may be better for engineering/technical students who need Windows-specific software."
    },
    {
      question: "Are ASUS gaming laptops worth the money?",
      answer: "ASUS gaming laptops, particularly their ROG (Republic of Gamers) and TUF series, offer excellent value for money. They typically provide powerful hardware at competitive price points compared to brands like Alienware or Razer. The ROG Zephyrus and Strix lines consistently rank among the best gaming laptops in terms of performance, cooling efficiency, and build quality. If you're looking for a high-performance gaming laptop without breaking the bank, ASUS models are definitely worth considering."
    },
    {
      question: "Is the HP Spectre x360 better than the Lenovo Yoga 9i?",
      answer: "The HP Spectre x360 and Lenovo Yoga 9i are both premium 2-in-1 laptops with similar price ranges. The Spectre x360 typically offers a more striking design with its gem-cut edges and superior battery life (around 10-12 hours). The Yoga 9i generally has better audio quality with its rotating soundbar and slightly more powerful performance configurations. Both have excellent displays and build quality. Your choice should depend on whether you prioritize battery life and design (Spectre) or audio experience and raw performance (Yoga)."
    },
    
    // Price Range Questions
    {
      question: "What are the best laptops under $500?",
      answer: "In the sub-$500 range, look for the Acer Aspire 5, Lenovo IdeaPad 3, HP Stream, and certain Chromebook models like the Samsung Chromebook 4 or Acer Chromebook Spin. These budget-friendly options offer sufficient performance for basic tasks like web browsing, document editing, and video streaming. For the best value, we recommend the Acer Aspire 5 with an AMD Ryzen processor if you need Windows, or the Acer Chromebook Spin if you can work with Chrome OS."
    },
    {
      question: "Which gaming laptops offer the best value under $1000?",
      answer: "For gaming under $1000, we recommend the Acer Nitro 5, Dell G15, HP Victus 15, ASUS TUF Gaming A15, and Lenovo IdeaPad Gaming 3. These models typically feature mid-range GPUs like the NVIDIA GTX 1650 or RTX 3050, capable of running most modern games at medium settings. The Acer Nitro 5 consistently offers the best price-to-performance ratio in this range, often featuring an RTX 3050 Ti GPU and Ryzen 5 processor."
    },
    {
      question: "Are $2000+ premium laptops worth the investment?",
      answer: "Premium laptops over $2000 like the MacBook Pro 16, Dell XPS 17, Razer Blade, or high-end ASUS ROG models deliver exceptional performance, build quality, display technology, and longer lifespans. For professionals in fields like video production, 3D modeling, or high-end programming, the investment is justified by the productivity gains. For casual users, the premium features may be overkill. Consider your long-term needs - a $2000 laptop might last 5-7 years, while budget models may need replacement after 2-3 years."
    },
    
    // Technical Questions
    {
      question: "Is 8GB RAM enough for a laptop in 2023?",
      answer: "8GB RAM is the bare minimum for a satisfactory experience in 2023. It's sufficient for basic tasks like web browsing, document editing, and streaming. However, if you multitask with multiple browser tabs, use office applications simultaneously, or perform any creative work like photo editing, we strongly recommend 16GB. For video editing, 3D modeling, or gaming, 16GB should be your starting point, with 32GB being ideal for professional work. Future-proofing your purchase with at least 16GB is advised as software requirements continue to increase."
    },
    {
      question: "What's better: Intel Core i7 or AMD Ryzen 7 processors?",
      answer: "The competition between Intel Core i7 and AMD Ryzen 7 is close. Currently, AMD Ryzen 7 processors (like the 7840U or 7940HS) generally offer better multi-core performance and battery efficiency, making them excellent for multitasking and content creation. Intel Core i7 processors (especially 13th Gen and newer) typically have stronger single-core performance, benefiting gaming and certain professional applications. Intel also has better compatibility with some software. For most users, Ryzen 7 provides better overall value, while specific use cases might favor Intel."
    },
    {
      question: "How important is a dedicated GPU in a laptop?",
      answer: "A dedicated GPU is essential for gaming, video editing, 3D modeling, CAD work, machine learning, and other graphics-intensive tasks. For these uses, look for NVIDIA RTX or AMD Radeon RX series GPUs. However, for general productivity, web browsing, document creation, and streaming, modern integrated graphics from Intel (Iris Xe) or AMD (Radeon Graphics) are perfectly capable and offer better battery life. Unless you're performing the specialized tasks mentioned, you can save money and gain battery efficiency by choosing a laptop without a dedicated GPU."
    },
    
    // Usage Specific
    {
      question: "Which laptop brand is most reliable for business use?",
      answer: "Lenovo ThinkPad, Dell Latitude, and HP EliteBook series consistently rank as the most reliable business laptops. ThinkPads are renowned for their durability, excellent keyboards, and long-term support. Dell Latitude offers superior build quality and excellent customer service for businesses. HP EliteBooks provide strong security features and reliability. All three brands offer comprehensive business warranty options, reliability testing to military standards, and enterprise-level support. For the best combination of reliability and performance, the Lenovo ThinkPad X1 Carbon and Dell Latitude 7000 series are top choices."
    },
    {
      question: "What's the best laptop for video editing?",
      answer: "For professional video editing, the MacBook Pro 16 with M2 Pro/Max chip offers the best combination of performance, display quality, and specialized software support. For Windows users, the Dell XPS 17, ASUS ProArt Studiobook, or high-end MSI Creator models with RTX graphics cards are excellent choices. Key specifications to look for include a color-accurate display (100% sRGB, ideally 100% Adobe RGB), 32GB+ RAM, fast SSD storage (1TB minimum), a powerful CPU (Intel i7/i9 or AMD Ryzen 7/9), and a dedicated GPU with at least 6GB VRAM. For 4K editing, prioritize models with RTX 3070 or better GPUs."
    },
    
    // User Experience
    {
      question: "How often is your laptop database updated?",
      answer: "Our database is updated daily with new models, price changes, and spec corrections. This ensures you're always seeing the most current and accurate information when making your laptop purchase decision. We track over 500 models across 15+ brands to provide you with comprehensive, up-to-date comparisons."
    },
    {
      question: "Can I trust your laptop reviews?",
      answer: "Absolutely! Our laptop assessments incorporate thousands of verified user reviews along with expert technical analysis. We aggregate review data from multiple sources including certified purchasers, professional tech reviewers, and long-term usage reports to provide a comprehensive and balanced evaluation of each laptop. Our team also personally tests many of the most popular models to verify claims about performance, battery life, and build quality."
    },
    {
      question: "How do I use your laptop comparison tool?",
      answer: "Simply browse our laptop selection and click the 'Compare' button on any laptops you're interested in. You can select up to three laptops to compare side-by-side, with detailed breakdowns of specs, performance, value, and user satisfaction. The tool clearly highlights the strengths and weaknesses of each model, making it easy to identify which laptop best meets your specific needs and budget constraints."
    },
    {
      question: "What if I need help choosing a laptop?",
      answer: "We offer a personalized recommendation tool that asks about your specific needs, usage, and budget. Based on your answers, we'll suggest the most suitable laptops for your requirements. You can also reach out to our community forum for advice from tech enthusiasts. For particularly complex needs, our team is available to provide personalized guidance through the contact form on our website."
    }
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-8 mb-16 mt-16">
      <div className="flex items-center justify-center mb-8">
        <HelpCircle className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions 🤔</h2>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <Laptop className="w-8 h-8 text-gaming-600 mb-2" />
            <h3 className="font-medium text-gray-800">Brand Comparisons</h3>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <DollarSign className="w-8 h-8 text-gaming-600 mb-2" />
            <h3 className="font-medium text-gray-800">Price Categories</h3>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <Zap className="w-8 h-8 text-gaming-600 mb-2" />
            <h3 className="font-medium text-gray-800">Technical Advice</h3>
          </div>
        </div>
        
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

