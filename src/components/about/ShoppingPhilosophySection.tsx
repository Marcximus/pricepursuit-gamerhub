
import React from 'react';
import { BookOpen, CheckCircle, ShieldCheck, HelpCircle } from 'lucide-react';

const ShoppingPhilosophySection = () => {
  return (
    <div className="mb-16 bg-gray-50 rounded-xl p-8">
      <div className="flex items-center justify-center mb-6">
        <BookOpen className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">Our Laptop Shopping Philosophy 📘</h2>
      </div>
      <div className="text-lg text-gray-600 max-w-3xl mx-auto">
        <p className="mb-4">
          At Laptop Hunter, we believe that the perfect laptop is out there for everyone—it's just a matter of finding it. Our philosophy is built on three key pillars:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-bold text-center mb-3">Honest Information</h3>
            <p className="text-gray-600 text-center">
              We prioritize transparency and accuracy above all. No paid promotions or hidden agendas—just clear, factual information.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-bold text-center mb-3">Buyer Protection</h3>
            <p className="text-gray-600 text-center">
              We track prices to ensure you never overpay, and we only link to reputable retailers with solid return policies.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-center mb-4">
              <HelpCircle className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-bold text-center mb-3">Simplified Tech</h3>
            <p className="text-gray-600 text-center">
              We translate complex specifications into simple terms so you can make informed decisions without the tech jargon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPhilosophySection;
