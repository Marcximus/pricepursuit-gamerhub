
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">No blog posts found.</p>
      <Link to="/blog/new">
        <Button>Create Your First Post</Button>
      </Link>
    </div>
  );
};

export default EmptyState;
