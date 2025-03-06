
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { ContactForm, ContactInfo } from './contact';

const ContactSection = () => {
  return (
    <div className="rounded-xl p-8 mb-16 bg-slate-600">
      <div className="flex items-center justify-center mb-8">
        <MessageCircle className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-slate-50">Contact Us 📨</h2>
      </div>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactSection;
