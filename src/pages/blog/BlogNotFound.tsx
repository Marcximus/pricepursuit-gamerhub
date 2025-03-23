
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';

const BlogNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-20 container mx-auto px-4 mt-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
        <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/blog')} variant="outline">
          Back to Blog
        </Button>
      </div>
    </div>
  );
};

export default BlogNotFound;
