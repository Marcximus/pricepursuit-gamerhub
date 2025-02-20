
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Laptops from './pages/Laptops';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a new QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ComparePrice/Laptops" element={<Laptops />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
