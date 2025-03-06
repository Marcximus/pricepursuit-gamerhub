import React, { useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: '',
        email: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };
  return <div className="rounded-xl p-8 mb-16 bg-slate-600">
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
              <span>
            </span>
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
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-slate-800 border-slate-600 text-slate-50" placeholder="Your name" />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-50 mb-1">
                  Email
                </label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="bg-slate-800 border-slate-600 text-slate-50" placeholder="you@example.com" />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-50 mb-1">
                  Message
                </label>
                <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required className="bg-slate-800 border-slate-600 text-slate-50 min-h-[120px]" placeholder="How can we help you?" />
              </div>
              
              <Button type="submit" className="w-full bg-gaming-600 hover:bg-gaming-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span> Sending...
                  </span> : <span className="flex items-center">
                    <Send className="w-4 h-4 mr-2" /> Send Message
                  </span>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>;
};
export default ContactSection;