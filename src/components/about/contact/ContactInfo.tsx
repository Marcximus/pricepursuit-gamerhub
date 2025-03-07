
import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';
const ContactInfo = () => {
  return <div className="text-slate-50">
      <h3 className="text-2xl font-semibold mb-4">We'd Love to Hear From You!</h3>
      <p className="mb-6">
        Have questions about laptops? Want to suggest a feature? Or just want to say hello?
        We're all ears! Drop us a message and our team will get back to you as soon as possible.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <Mail className="w-5 h-5 mr-3 text-gaming-600" />
          <span>contact@laptophunter.example.com</span>
        </div>
        <div className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-3 text-gaming-600" />
          <span>Join our community on Discord</span>
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="text-lg font-medium mb-2">Response Time</h4>
        <p>We typically respond within 24-48 hours during business days.</p>
      </div>
    </div>;
};
export default ContactInfo;
