
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
          <Route path="/" element={<Laptops />} />
          <Route path="/ComparePrice/Laptops" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;

