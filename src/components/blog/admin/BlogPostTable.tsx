
import { format } from 'date-fns';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BlogPost } from '@/contexts/BlogContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface BlogPostTableProps {
  posts: BlogPost[];
  isDeleting: boolean;
  onDeleteConfirm: (postId: string) => void;
}

const BlogPostTable = ({ posts, isDeleting, onDeleteConfirm }: BlogPostTableProps) => {
  const navigate = useNavigate();

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Top10': return 'bg-blue-100 text-blue-800';
      case 'Review': return 'bg-green-100 text-green-800';
      case 'Comparison': return 'bg-purple-100 text-purple-800';
      case 'How-To': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium max-w-[300px] truncate">
                {post.title}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(post.category)}`}>
                  {post.category}
                </span>
              </TableCell>
              <TableCell>{format(new Date(post.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                {post.published ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">Draft</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/blog/${post.category}/post/${post.slug}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/blog/new?edit=${post.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDeleteConfirm(post.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BlogPostTable;
