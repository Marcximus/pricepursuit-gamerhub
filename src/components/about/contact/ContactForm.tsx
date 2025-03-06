
import React from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useContactForm } from './hooks/useContactForm';

const ContactForm = () => {
  const { formData, formErrors, isSubmitting, handleChange, handleSubmit } = useContactForm();

  return (
    <div className="bg-slate-700 p-6 rounded-lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-50 mb-1">
              Name
            </label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className={`bg-slate-800 border-slate-600 text-slate-50 ${formErrors.name ? 'border-red-400' : ''}`} 
              placeholder="Your name" 
            />
            {formErrors.name && (
              <div className="mt-1 text-sm text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.name}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-50 mb-1">
              Email
            </label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              className={`bg-slate-800 border-slate-600 text-slate-50 ${formErrors.email ? 'border-red-400' : ''}`} 
              placeholder="you@example.com" 
            />
            {formErrors.email && (
              <div className="mt-1 text-sm text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.email}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-50 mb-1">
              Message
            </label>
            <Textarea 
              id="message" 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              className={`bg-slate-800 border-slate-600 text-slate-50 min-h-[120px] ${formErrors.message ? 'border-red-400' : ''}`} 
              placeholder="How can we help you?" 
            />
            {formErrors.message && (
              <div className="mt-1 text-sm text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.message}
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gaming-600 hover:bg-gaming-700 text-white" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⏳</span> Sending...
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="w-4 h-4 mr-2" /> Send Message
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
