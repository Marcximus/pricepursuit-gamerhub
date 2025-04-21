
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <main className="bg-white font-serif min-h-screen flex items-center justify-center" role="main">
      <Helmet>
        <title>Page Not Found | Laptop Hunter</title>
        <meta name="description" content="The page you are looking for could not be found. Return to Laptop Hunter to find the best laptop deals and comparisons." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <section className="container mx-auto">
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 text-center">
            <div
              className="bg-[url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)] h-[250px] sm:h-[350px] md:h-[400px] bg-center bg-no-repeat bg-contain"
              aria-hidden="true"
            >
              <h1 className="text-center text-black text-6xl sm:text-7xl md:text-8xl pt-6 sm:pt-8">
                404
              </h1>
            </div>
            <div className="mt-[-50px]">
              <h2 className="text-2xl text-black sm:text-3xl font-bold mb-4">
                Look like you're lost
              </h2>
              <p className="mb-6 text-black sm:mb-5">
                The page you are looking for is not available!
              </p>
              <Button
                variant="default"
                onClick={() => navigate("/")}
                className="my-5 bg-green-600 hover:bg-green-700"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
