import React from 'react';
import { Award } from 'lucide-react';
const ComparisonTableSection = () => {
  return <div className="mb-16 bg-gaming-50 rounded-xl p-8 bg-amber-50">
      <div className="flex items-center justify-center mb-6">
        <Award className="w-8 h-8 text-gaming-600 mr-2" />
        <h2 className="text-3xl font-bold text-gray-900">How We Compare to Other Laptop Sites 🏆</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full max-w-4xl mx-auto text-left border-collapse">
          <thead>
            <tr className="bg-gaming-100">
              <th className="p-4 border-b-2 border-gaming-200">Feature</th>
              <th className="p-4 border-b-2 border-gaming-200">Laptop Hunter</th>
              <th className="p-4 border-b-2 border-gaming-200">Other Laptop Sites</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="p-4 border-b border-gaming-100 font-medium">Price Tracking</td>
              <td className="p-4 border-b border-gaming-100 text-gaming-600">✓ Real-time across multiple retailers</td>
              <td className="p-4 border-b border-gaming-100">Limited or single-source tracking</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-4 border-b border-gaming-100 font-medium">Comparison Tool</td>
              <td className="p-4 border-b border-gaming-100 text-gaming-600">✓ Side-by-side with AI analysis</td>
              <td className="p-4 border-b border-gaming-100">Basic spec comparison only</td>
            </tr>
            <tr className="bg-white">
              <td className="p-4 border-b border-gaming-100 font-medium">AI Recommendation</td>
              <td className="p-4 border-b border-gaming-100 text-gaming-600">✓ Personalized to your specific needs</td>
              <td className="p-4 border-b border-gaming-100">Generic recommendations</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-4 border-b border-gaming-100 font-medium">Spec Translation</td>
              <td className="p-4 border-b border-gaming-100 text-gaming-600">✓ Plain language explanations</td>
              <td className="p-4 border-b border-gaming-100">Technical jargon</td>
            </tr>
            <tr className="bg-white">
              <td className="p-4 font-medium">Affiliate Bias</td>
              <td className="p-4 text-gaming-600">✓ Transparent about partnerships</td>
              <td className="p-4">Often prioritize sponsored products</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
};
export default ComparisonTableSection;