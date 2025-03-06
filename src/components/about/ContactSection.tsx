
import React, { useState } from 'react';
import { Mail, MessageCircle, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      message?: string;
    } = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        throw new Error(error.message);
      }

      // Success!
      toast.success(data?.message || "Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send your message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl p-8 mb-16 bg-slate-600">
      <div className="flex items-center justify-center mb-8">
        <MessageCircle className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-slate-50">Contact Us 📨</h2>
      </div>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-slate-50">
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
        </div>
        
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
      </div>
    </div>
  );
};

export default ContactSection;
