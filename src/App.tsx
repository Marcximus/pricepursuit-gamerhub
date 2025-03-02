
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import ComparePriceLaptops from "./pages/Laptops";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { preloadLaptopData } from "./services/laptopService";

// Create a new query client with specific options for better debugging
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Preload laptop data once when the app starts
preloadLaptopData();

function App() {
  console.log('App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen w-full bg-background">
          <Router>
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/" element={<ComparePriceLaptops />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
