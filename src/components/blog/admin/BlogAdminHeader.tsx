
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogAdminHeaderProps {
  onRefresh: () => void;
}

const BlogAdminHeader = ({ onRefresh }: BlogAdminHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Blog Admin</h1>
      <div className="flex space-x-4">
        <Button onClick={onRefresh} variant="outline">
          Refresh Posts
        </Button>
        <Link to="/blog/new">
          <Button className="flex items-center">
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BlogAdminHeader;
