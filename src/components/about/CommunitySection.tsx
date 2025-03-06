import React from 'react';
import { MessageSquare, Share2 } from 'lucide-react';
const CommunitySection = () => {
  return <div className="mb-16">
      <div className="flex items-center justify-center mb-6">
        <MessageSquare className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">Community & Support 🤝</h2>
      </div>
      <div className="text-lg text-gray-600 max-w-3xl mx-auto text-center">
        <p className="mb-6">
          Laptop Hunter is more than just a tool—it's a community of tech enthusiasts, savvy shoppers, and helpful experts.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="p-6 rounded-lg shadow-md bg-purple-50">
            <div className="flex justify-center mb-4">
              <Share2 className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">Share Your Findings</h3>
            <p className="text-gray-600">
              Found the perfect laptop deal? Share it with friends and family directly from our site, or save your comparisons for later.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gaming-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">Get Expert Advice</h3>
            <p className="text-gray-600">
              Still have questions? Our AI assistant can help, or you can contact our team of laptop enthusiasts for personalized recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default CommunitySection;