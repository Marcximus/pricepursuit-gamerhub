
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import ComparePriceLaptops from "./pages/Laptops";
import ComparePage from "./pages/Compare";
import Recommend from "./pages/Recommend";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import Blog from "./pages/blog/Blog";
import BlogPost from "./pages/blog/BlogPost";
import BlogCategory from "./pages/blog/BlogCategory";
import BlogAdmin from "./pages/blog/BlogAdmin";
import NewBlogPost from "./pages/blog/NewBlogPost";
import { BlogProvider } from "./contexts/BlogContext";
import { HelmetProvider } from 'react-helmet-async';
import SitemapXml from "./pages/SitemapXml";
import ProtectedRoute from "@/components/ProtectedRoute";

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
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ComparisonProvider>
            <BlogProvider>
              <div className="min-h-screen w-full bg-background">
                <Router>
                  <div className="container mx-auto px-4 py-8">
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requireAdmin>
                            <Admin />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/" element={<ComparePriceLaptops />} />
                      <Route path="/compare" element={<ComparePage />} />
                      <Route path="/recommend" element={<Recommend />} />
                      <Route path="/about" element={<About />} />

                      {/* Blog Routes */}
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:category" element={<BlogCategory />} />
                      <Route path="/blog/:category/post/:slug" element={<BlogPost />} />
                      <Route
                        path="/blog/admin"
                        element={
                          <ProtectedRoute>
                            <BlogAdmin />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/blog/new"
                        element={
                          <ProtectedRoute>
                            <NewBlogPost />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Dynamic Sitemap XML route */}
                      <Route path="/sitemap.xml" element={<SitemapXml />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </Router>
              </div>
              <Toaster />
            </BlogProvider>
          </ComparisonProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

