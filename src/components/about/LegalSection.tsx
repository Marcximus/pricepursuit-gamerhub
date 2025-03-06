import React, { useState } from 'react';
import { Shield, FileText, Scale, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
const LegalSection = () => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const legalSections = [{
    id: 'terms',
    icon: <FileText className="w-5 h-5 text-blue-500" />,
    title: 'Terms of Service',
    content: `
        <p>By accessing this website, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
        
        <p>The materials contained in this website are protected by applicable copyright and trademark law. Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only.</p>
        
        <p>This permission shall automatically terminate if you violate any of these restrictions and may be terminated by Laptop Hunter at any time.</p>
        
        <p>The services and all content on this website are provided on an 'as is' basis without warranties of any kind, either express or implied.</p>
      `
  }, {
    id: 'privacy',
    icon: <Shield className="w-5 h-5 text-green-500" />,
    title: 'Privacy Policy',
    content: `
        <p>Your privacy is important to us. It is Laptop Hunter's policy to respect your privacy regarding any information we may collect from you across our website.</p>
        
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
        
        <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
        
        <p>We don't share any personally identifying information publicly or with third-parties, except when required to by law.</p>
      `
  }, {
    id: 'disclaimer',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    title: 'Disclaimer',
    content: `
        <p>While we strive to provide accurate information about laptop specifications, pricing, and availability, we cannot guarantee the accuracy or completeness of all content. Prices and availability are subject to change without notice.</p>
        
        <p>The laptop comparisons, recommendations, and reviews provided on this website are for informational purposes only. They do not constitute professional advice, and your reliance on such information is solely at your own risk.</p>
        
        <p>We use affiliate links for product listings which means we may earn a commission if you make a purchase through our links, at no additional cost to you. This helps support our service and enables us to continue providing value to our users.</p>
        
        <p>All product names, logos, and brands are property of their respective owners and are used solely for identification purposes. Use of these names, logos, and brands does not imply endorsement.</p>
      `
  }, {
    id: 'liability',
    icon: <Scale className="w-5 h-5 text-red-500" />,
    title: 'Limitation of Liability',
    content: `
        <p>In no event shall Laptop Hunter or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Laptop Hunter's website, even if Laptop Hunter or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
        
        <p>Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>
        
        <p>The materials appearing on Laptop Hunter's website could include technical, typographical, or photographic errors. Laptop Hunter does not warrant that any of the materials on its website are accurate, complete or current. Laptop Hunter may make changes to the materials contained on its website at any time without notice.</p>
      `
  }];
  return <div className="rounded-xl p-8 mb-16 bg-gray-100 border border-gray-200">
      <div className="flex items-center justify-center mb-8">
        <Shield className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">Legal Information 📝</h2>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <p className="text-gray-600 mb-6 text-center">
          The legal stuff matters! Please review the following information about how we operate and the terms that govern your use of our service.
        </p>
        
        <Accordion type="single" collapsible className="w-full">
          {legalSections.map(section => <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="text-lg font-medium flex items-center">
                <span className="flex items-center">
                  {section.icon}
                  <span className="ml-2">{section.title}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
              __html: section.content
            }} />
              </AccordionContent>
            </AccordionItem>)}
        </Accordion>
        
        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>Last updated: June 1723 (I dont know, who cares)</p>
          <p>If you have any questions about these terms, please contact us.</p>
        </div>
      </div>
    </div>;
};
export default LegalSection;