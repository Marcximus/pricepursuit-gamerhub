
import { Link } from "react-router-dom";
import { Gamepad, ChevronRight, Zap, DollarSign, NewspaperIcon } from "lucide-react";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="page-transition min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gaming-900 tracking-tight">
              Find the Best Gaming Gear
              <span className="text-gaming-600"> at the Best Price</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gaming-600 max-w-3xl mx-auto">
              Compare prices across multiple retailers and make informed decisions about your gaming setup.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/ComparePrice"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gaming-600 hover:bg-gaming-700 transition-colors"
              >
                Start Comparing
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center px-6 py-3 border border-gaming-600 text-base font-medium rounded-lg text-gaming-600 hover:bg-gaming-50 transition-colors"
              >
                Read Our Blog
                <NewspaperIcon className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-xl">
              <DollarSign className="w-12 h-12 text-gaming-600 mb-4" />
              <h3 className="text-xl font-semibold text-gaming-900">Price Comparison</h3>
              <p className="mt-2 text-gaming-600">
                Compare prices across multiple retailers to find the best deals on gaming equipment.
              </p>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <Zap className="w-12 h-12 text-gaming-600 mb-4" />
              <h3 className="text-xl font-semibold text-gaming-900">Real-time Updates</h3>
              <p className="mt-2 text-gaming-600">
                Get the latest prices and availability updates in real-time.
              </p>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <Gamepad className="w-12 h-12 text-gaming-600 mb-4" />
              <h3 className="text-xl font-semibold text-gaming-900">Expert Reviews</h3>
              <p className="mt-2 text-gaming-600">
                Read detailed reviews and comparisons from gaming experts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
