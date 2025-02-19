
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LaptopsPage from "./pages/Laptops";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ComparePrice" element={<NotFound />} />
          <Route path="/ComparePrice/Laptops" element={<LaptopsPage />} />
          <Route path="/ComparePrice/Desktops" element={<NotFound />} />
          <Route path="/ComparePrice/Monitors" element={<NotFound />} />
          <Route path="/ComparePrice/GraphicsCards" element={<NotFound />} />
          <Route path="/ComparePrice/Keyboards" element={<NotFound />} />
          <Route path="/ComparePrice/Mouse" element={<NotFound />} />
          <Route path="/ComparePrice/Headsets" element={<NotFound />} />
          <Route path="/ComparePrice/VRHeadsets" element={<NotFound />} />
          <Route path="/blog" element={<NotFound />} />
          <Route path="/blog/Top10/post/:slug" element={<NotFound />} />
          <Route path="/blog/Review/post/:slug" element={<NotFound />} />
          <Route path="/blog/Comparison/post/:slug" element={<NotFound />} />
          <Route path="/blog/How-To/post/:slug" element={<NotFound />} />
          <Route path="/blog/GamerHardwareNews/post/:slug" element={<NotFound />} />
          <Route path="/blog/admin" element={<NotFound />} />
          <Route path="/blog/newT" element={<NotFound />} />
          <Route path="/blog/newC" element={<NotFound />} />
          <Route path="/blog/newR" element={<NotFound />} />
          <Route path="/blog/newH" element={<NotFound />} />
          <Route path="/blog/newN" element={<NotFound />} />
          <Route path="/auth" element={<NotFound />} />
          <Route path="/about" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
