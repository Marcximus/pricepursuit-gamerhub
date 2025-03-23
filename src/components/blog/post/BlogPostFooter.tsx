
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RelatedPosts } from '../RelatedPosts';

interface BlogPostFooterProps {
  postId: string;
  category: string;
}

export const BlogPostFooter = ({ postId, category }: BlogPostFooterProps) => {
  return (
    <>
      <RelatedPosts currentPostId={postId} currentCategory={category} />
      
      <Separator className="my-8" />
      
      <div className="flex justify-between items-center py-4">
        <Link to={`/blog/${category}`}>
          <Button variant="outline">
            ← More {category === 'Top10' ? 'Top 10 Lists' : category === 'How-To' ? 'How-To Guides' : `${category} Articles`}
          </Button>
        </Link>
        <Link to="/blog">
          <Button variant="outline">All Blog Posts</Button>
        </Link>
      </div>
    </>
  );
};
