
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Find the Best Laptop Deals
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Compare prices and specifications of popular laptops to make the best purchase decision.
          </p>
          <div className="mt-10">
            <Link to="/ComparePrice/Laptops">
              <Button size="lg" className="text-lg px-8">
                Compare Laptops
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">Price Tracking</h3>
            <p className="mt-2 text-gray-600">
              Monitor laptop prices over time to find the best deals and price drops.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Specs</h3>
            <p className="mt-2 text-gray-600">
              Compare processor performance, RAM, storage, and other key specifications.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">User Reviews</h3>
            <p className="mt-2 text-gray-600">
              Read authentic user ratings and reviews to make informed decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
