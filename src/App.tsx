
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Recommend from './pages/Recommend';
import Laptops from './pages/Laptops';
import Compare from './pages/Compare';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Blog from './pages/blog/Blog';
import BlogPost from './pages/blog/BlogPost';
import BlogCategory from './pages/blog/BlogCategory';
import BlogAdmin from './pages/blog/BlogAdmin';
import NewBlogPost from './pages/blog/NewBlogPost';
import ProtectedRoute from './components/ProtectedRoute';
import { ensureBlogAssetsBucket } from './services/blog';
import { BlogProvider } from './contexts/BlogContext';
import { ComparisonProvider } from './contexts/ComparisonContext';

function App() {
  useEffect(() => {
    // Ensure blog assets storage bucket exists
    ensureBlogAssetsBucket()
      .then(success => {
        if (success) {
          console.log('Blog assets storage bucket is ready');
        }
      })
      .catch(error => {
        console.error('Failed to initialize blog assets storage:', error);
      });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Recommend />} />
        <Route path="/laptops" element={<Laptops />} />
        <Route path="/compare" element={
          <ComparisonProvider>
            <Compare />
          </ComparisonProvider>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:category/post/:slug" element={<BlogPost />} />
        <Route path="/blog/:category" element={<BlogCategory />} />
        <Route path="/blog/new" element={
          <BlogProvider>
            <NewBlogPost />
          </BlogProvider>
        } />
        <Route path="/blog/admin" element={
          <ProtectedRoute>
            <BlogAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
