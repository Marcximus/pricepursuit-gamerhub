
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import ComparePriceLaptops from "./pages/Laptops";
import ComparePage from "./pages/Compare";
import Recommend from "./pages/Recommend";
import NotFound from "./pages/NotFound";
import { ComparisonProvider } from "./contexts/ComparisonContext";

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

function App() {
  console.log('App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ComparisonProvider>
          <div className="min-h-screen w-full bg-background">
            <Router>
              <div className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/" element={<ComparePriceLaptops />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/recommend" element={<Recommend />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </div>
          <Toaster />
        </ComparisonProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
