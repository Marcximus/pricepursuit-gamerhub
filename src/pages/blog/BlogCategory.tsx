
import { useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useBlog } from '@/contexts/blog';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { BlogPageSEO } from '@/components/blog/BlogPageSEO';

const BlogCategory = () => {
  const { category } = useParams<{ category: string }>();
  const { getPostsByCategory } = useBlog();
  const location = useLocation();
  const currentUrl = window.location.origin + location.pathname;
  
  const posts = category ? getPostsByCategory(category) : [];
  
  const getCategoryDisplayName = () => {
    if (!category) return '';
    switch (category) {
      case 'Top10': return 'Top 10 Lists';
      case 'Review': return 'Laptop Reviews';
      case 'Comparison': return 'Laptop Comparisons';
      case 'How-To': return 'How-To Guides';
      default: return category;
    }
  };
  
  const getSEODescription = () => {
    if (!category) return '';
    switch (category) {
      case 'Top10': return 'Discover the best laptops in various categories with our carefully curated top 10 lists. Find the perfect laptop for your specific needs and budget.';
      case 'Review': return 'In-depth reviews of the latest laptops, helping you understand the pros and cons of each model before making your purchase decision.';
      case 'Comparison': return 'Head-to-head comparisons between popular laptop models, highlighting the key differences and helping you choose the right one.';
      case 'How-To': return 'Practical guides to help you get the most out of your laptop, from maintenance tips to performance optimization and troubleshooting.';
      default: return `Browse our collection of laptop ${category} articles.`;
    }
  };
  
  useEffect(() => {
    document.title = `${getCategoryDisplayName()} | Laptop Hunter Blog`;
  }, [category]);
  
  if (!category) {
    return <div>Invalid category</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogPageSEO 
        title={`${getCategoryDisplayName()} | Laptop Hunter Blog`}
        description={getSEODescription()}
        url={currentUrl}
        image="/og-image.png"
      />
      
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="mb-8">
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="flex items-center text-gray-600 mb-4">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Blog
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{getCategoryDisplayName()}</h1>
          <p className="text-xl text-gray-600 w-full leading-relaxed tracking-wide min-h-[3rem]">
            {getSEODescription()}
          </p>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No posts in this category yet.</p>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="flex flex-col h-full transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border-2">
                <Link 
                  to={`/blog/${post.category}/post/${post.slug}`}
                  className="flex flex-col flex-grow"
                >
                  {post.image_url && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader className="flex-grow space-y-3">
                    <CardTitle className="line-clamp-2 text-xl font-semibold text-gray-800 hover:text-green-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <div className="text-sm text-gray-500 space-x-2">
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{post.category === 'Top10' ? 'Top 10' : post.category === 'How-To' ? 'How-To Guide' : post.category}</span>
                    </div>
                    <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  </CardHeader>
                </Link>
                <CardFooter className="pt-0">
                  <Link to={`/blog/${post.category}/post/${post.slug}`} className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-200"
                    >
                      Read Article
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCategory;
