
import { Helmet } from 'react-helmet-async';

interface BlogPageSEOProps {
  title: string;
  description: string;
  url: string;
  image?: string;
}

export const BlogPageSEO = ({ title, description, url, image }: BlogPageSEOProps) => {
  // Ensure URL is properly formatted
  const canonicalUrl = url.startsWith('http') ? url : window.location.origin + url;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      <link rel="canonical" href={canonicalUrl} />
      
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};
