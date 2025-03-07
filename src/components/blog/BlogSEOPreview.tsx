
import { BlogPost } from '@/contexts/BlogContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BlogSEOPreviewProps {
  post: Partial<BlogPost>;
  url?: string;
}

export const BlogSEOPreview = ({ post, url }: BlogSEOPreviewProps) => {
  // Clean description from excerpt (remove HTML tags if any)
  const cleanDescription = post.excerpt ? post.excerpt.replace(/<[^>]*>?/gm, '') : '';
  
  // Extract keywords from tags or use category
  const keywords = post.tags?.join(', ') || post.category || '';
  
  // Demo URL for preview
  const previewUrl = url || `https://example.com/blog/${post.category || 'category'}/post/${post.slug || 'post-slug'}`;
  
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">SEO Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0 text-sm">
        <div>
          <h3 className="font-medium text-blue-600 mb-1 truncate">
            {post.title ? `${post.title} | Laptop Hunter Blog` : 'Your Post Title | Laptop Hunter Blog'}
          </h3>
          <p className="text-green-700 text-xs mb-1 truncate">{previewUrl}</p>
          <p className="text-gray-600 line-clamp-2">
            {cleanDescription || 'Your post excerpt will appear here and in search results...'}
          </p>
        </div>
        
        <div className="space-y-2">
          <div>
            <span className="font-medium block">Meta Tags:</span>
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li>Title: {post.title || 'Not set'}</li>
              <li>Description: {cleanDescription.substring(0, 50)}...</li>
              <li>Keywords: {keywords || 'Not set'}</li>
              <li>Author: {post.author || 'Not set'}</li>
            </ul>
          </div>
          
          <div>
            <span className="font-medium block">Open Graph / Social:</span>
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li>OG Title: {post.title || 'Not set'}</li>
              <li>OG Description: {cleanDescription.substring(0, 50)}...</li>
              <li>OG Image: {post.image_url ? '✓ Set' : '✗ Not set'}</li>
              <li>Twitter Card: summary_large_image</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
