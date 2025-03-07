
import { Helmet } from 'react-helmet-async';
import { BlogPost } from '@/contexts/BlogContext';

interface BlogSEOProps {
  post: BlogPost;
  url: string;
}

export const BlogSEO = ({ post, url }: BlogSEOProps) => {
  // Create clean description from excerpt (remove HTML tags if any)
  const cleanDescription = post.excerpt.replace(/<[^>]*>?/gm, '');
  
  // Extract keywords from tags or use category
  const keywords = post.tags?.join(', ') || post.category;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{post.title} | Laptop Hunter Blog</title>
      <meta name="description" content={cleanDescription} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph Tags for Social Media */}
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      {post.image_url && <meta property="og:image" content={post.image_url} />}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={cleanDescription} />
      {post.image_url && <meta name="twitter:image" content={post.image_url} />}
      
      {/* Article Specific Meta Tags */}
      <meta property="article:published_time" content={post.created_at} />
      {post.updated_at && <meta property="article:modified_time" content={post.updated_at} />}
      <meta property="article:section" content={post.category} />
      {post.tags?.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Author Information */}
      <meta name="author" content={post.author} />
    </Helmet>
  );
};
