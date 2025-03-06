import React from 'react';
import { HelpCircle, Laptop, Search, GitCompare, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
const FAQSection = () => {
  // Organize FAQs by category for better user experience and SEO
  const faqCategories = [{
    icon: <Search className="w-5 h-5 text-blue-500" />,
    name: "Using Our Site",
    faqs: [{
      question: "How does Laptop Hunter find the best deals?",
      answer: "We continuously track prices across major retailers and use advanced algorithms to identify price drops, sales, and the best overall value. Our system updates regularly to ensure you always have access to the most current pricing information. You can browse all our deals on the <a href='/'>Laptops page</a>."
    }, {
      question: "Are your laptop recommendations biased?",
      answer: "No, our recommendations are completely unbiased. While we may earn affiliate commissions on some purchases, our ranking algorithm is based purely on specs, performance, value, and user reviews. We never promote specific brands or models based on commission rates."
    }, {
      question: "How often is your laptop database updated?",
      answer: "Our database is updated daily with new models, price changes, and spec corrections. This ensures you're always seeing the most current and accurate information when making your laptop purchase decision."
    }, {
      question: "Why should I use Laptop Hunter instead of going directly to retailer websites?",
      answer: "Laptop Hunter saves you hours of research by aggregating information from multiple retailers, standardizing specs for easy comparison, tracking price history, and providing unbiased recommendations. Our <a href='/compare'>comparison tool</a> and <a href='/recommend'>personalized recommendation engine</a> help you find the perfect laptop faster than browsing individual retailer sites."
    }]
  }, {
    icon: <GitCompare className="w-5 h-5 text-purple-500" />,
    name: "Comparing Laptops",
    faqs: [{
      question: "How do I use your laptop comparison tool?",
      answer: "Simply browse our laptop selection and click the 'Compare' button on any laptops you're interested in. You can select up to three laptops to compare side-by-side on our <a href='/compare'>comparison page</a>, with detailed breakdowns of specs, performance, value, and user satisfaction."
    }, {
      question: "Can I compare laptops across different brands?",
      answer: "Absolutely! Our <a href='/compare'>comparison tool</a> allows you to compare any laptops in our database regardless of brand. This is especially useful for comparing popular models like MacBooks vs Dell XPS or HP Spectre vs Lenovo ThinkPad."
    }, {
      question: "How accurate are your laptop performance comparisons?",
      answer: "Our performance comparisons are based on a combination of benchmark data, technical specifications, and real-world performance metrics. While synthetic benchmarks don't tell the whole story, our AI-powered analysis provides a reliable indicator of relative performance for different usage scenarios."
    }, {
      question: "Can I share my laptop comparison results with others?",
      answer: "Yes! After comparing laptops on our <a href='/compare'>comparison page</a>, you can share your results via a unique URL. This is perfect for getting a second opinion from friends or family before making your purchase decision."
    }]
  }, {
    icon: <Laptop className="w-5 h-5 text-green-500" />,
    name: "Finding Your Perfect Laptop",
    faqs: [{
      question: "What if I need help choosing a laptop?",
      answer: "We offer a <a href='/recommend'>personalized recommendation tool</a> that asks about your specific needs, usage, and budget. Based on your answers, we'll suggest the most suitable laptops for your requirements. You can also reach out to our community forum for advice from tech enthusiasts."
    }, {
      question: "How do I find laptops within my budget?",
      answer: "You can use the price filter on our <a href='/'>Laptops page</a> to set your minimum and maximum budget. Our search results will update automatically to show only laptops within your price range. You can further refine your search using other filters like brand, specs, and features."
    }, {
      question: "Which laptop brands do you recommend?",
      answer: "We don't universally recommend specific brands as each has strengths and weaknesses. Apple offers premium build quality and ecosystem integration. Dell and HP provide excellent business laptops. Lenovo offers great value. ASUS and Acer have strong gaming options. MSI and Razer specialize in high-performance gaming machines. Use our <a href='/recommend'>recommendation tool</a> to find the best brand for your specific needs."
    }, {
      question: "How much RAM do I need in a laptop?",
      answer: "For basic tasks and web browsing, 8GB RAM is sufficient. For productivity work, photo editing, or casual gaming, aim for 16GB. Content creators, professional gamers, and those running virtual machines should consider 32GB or more. Our <a href='/recommend'>laptop finder tool</a> can help recommend the right RAM configuration based on your usage patterns."
    }, {
      question: "What's the difference between SSD and HDD storage?",
      answer: "SSDs (Solid State Drives) are significantly faster, more reliable, and more energy-efficient than HDDs (Hard Disk Drives), but typically more expensive per gigabyte. Most modern laptops use SSDs for better performance. The storage type is clearly indicated in our laptop specifications and you can filter by storage type on our <a href='/'>main page</a>."
    }]
  }, {
    icon: <List className="w-5 h-5 text-amber-500" />,
    name: "Technical Questions",
    faqs: [{
      question: "What's better for gaming: Intel or AMD processors?",
      answer: "Both Intel and AMD offer excellent gaming processors. Intel's Core i7 and i9 typically excel in pure gaming performance, while AMD's Ryzen 7 and 9 often provide better value and multi-tasking capability. For gaming laptops specifically, look at models with dedicated GPUs from NVIDIA or AMD, which have a bigger impact on gaming performance than the CPU alone. You can compare specific models on our <a href='/compare'>comparison page</a>."
    }, {
      question: "Are gaming laptops good for video editing?",
      answer: "Yes, gaming laptops are typically excellent for video editing because they share many requirements: powerful processors, dedicated graphics, ample RAM, and good cooling systems. However, if video editing is your primary focus, look for models with color-accurate displays and potentially more RAM than a typical gaming setup. Use our <a href='/recommend'>personalized recommendation tool</a> for specific suggestions."
    }, {
      question: "How important is the graphics card in a laptop?",
      answer: "It depends on your usage. For basic tasks, web browsing, and office work, integrated graphics are sufficient. For gaming, 3D modeling, video editing, or machine learning, a dedicated graphics card is essential. The more demanding your visual tasks, the more powerful GPU you'll need. You can filter laptops by graphics card type on our <a href='/'>main page</a>."
    }, {
      question: "What screen resolution should I look for in a laptop?",
      answer: "For laptops under 14 inches, 1080p (Full HD) is generally sufficient. For larger screens or creative work, consider 1440p or 4K. However, higher resolutions consume more battery and require more powerful hardware to run smoothly. Our <a href='/compare'>comparison tool</a> helps you evaluate the trade-offs between different display options."
    }, {
      question: "How long should a laptop battery last?",
      answer: "Modern laptops should offer at least 8 hours of battery life for light usage. Ultrabooks and MacBooks often provide 10-15+ hours. Gaming laptops typically last 3-6 hours on battery. Battery life varies significantly based on usage intensity, screen brightness, and power settings. You can find battery life information in our detailed laptop specifications."
    }]
  }, {
    icon: <HelpCircle className="w-5 h-5 text-red-500" />,
    name: "Buying Advice",
    faqs: [{
      question: "When is the best time to buy a laptop?",
      answer: "The best times to buy are typically during major sales events like Black Friday, Cyber Monday, Amazon Prime Day, and back-to-school season (July-September). Additionally, new laptop models are often released around CES (January) and Computex (May/June), which can lead to discounts on previous-generation models. Our site tracks price history to help you identify good deals."
    }, {
      question: "Should I wait for the next generation of processors before buying?",
      answer: "If your current laptop is meeting your needs, waiting for next-gen processors might be worth it. However, there's always newer technology on the horizon, and the performance gains between consecutive generations are often incremental. If you need a laptop now, it's usually better to buy one that meets your requirements rather than waiting indefinitely. Check our <a href='/'>latest laptops</a> to see what's currently available."
    }, {
      question: "Is it worth paying extra for an extended warranty?",
      answer: "This depends on how you use your laptop and your risk tolerance. Extended warranties can provide peace of mind, especially for premium or gaming laptops that are expensive to repair. However, many credit cards offer extended warranty protection automatically, and reliability for major brands has improved. Consider the warranty terms and what's covered before deciding."
    }, {
      question: "What's the typical lifespan of a laptop?",
      answer: "Most laptops remain functionally useful for 3-5 years, though premium models may last longer. Business laptops from Lenovo ThinkPad, Dell Latitude, or HP EliteBook lines are often built for longer lifespans. Gaming laptops may become outdated faster due to increasing game requirements. Battery life typically degrades after 2-3 years regardless of laptop quality."
    }]
  }];
  return <div className="rounded-xl p-8 mb-16 mt-16 bg-slate-600">
      <div className="flex items-center justify-center mb-8">
        <HelpCircle className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-slate-50">Frequently Asked Questions 🤔</h2>
      </div>
      
      <div className="max-w-3xl mx-auto">
        {faqCategories.map((category, categoryIndex) => <div key={categoryIndex} className="mb-8">
            <div className="flex items-center mb-4">
              {category.icon}
              <h3 className="text-xl font-semibold ml-2 text-slate-50">{category.name}</h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {category.faqs.map((faq, faqIndex) => <AccordionItem key={faqIndex} value={`${categoryIndex}-item-${faqIndex}`}>
                  <AccordionTrigger className="text-lg font-medium text-slate-50">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <div dangerouslySetInnerHTML={{
                __html: faq.answer.replace(/<a href='([^']+)'>(.*?)<\/a>/g, (match, url, text) => `<Link to="${url}" className="text-gaming-600 hover:underline">${text}</Link>`)
              }} />
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>)}
      </div>
    </div>;
};
export default FAQSection;