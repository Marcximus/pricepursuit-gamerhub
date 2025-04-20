
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBlog } from '@/contexts/blog';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BlogPageSEO } from '@/components/blog/BlogPageSEO';

const Blog = () => {
  const { loading, error, getRecentPosts } = useBlog();
  const recentPosts = getRecentPosts(6);
  const location = useLocation();
  const currentUrl = window.location.origin + location.pathname;
  
  useEffect(() => {
    document.title = "Laptop Hunter Blog";
  }, []);

  const categories = [
    { id: 'Top10', name: 'Top 10 Lists', description: 'Find the best laptops in various categories.' },
    { id: 'Review', name: 'Laptop Reviews', description: 'In-depth reviews of the latest laptops.' },
    { id: 'Comparison', name: 'Laptop Comparisons', description: 'Head-to-head comparisons between popular models.' },
    { id: 'How-To', name: 'How-To Guides', description: 'Helpful guides to get the most out of your laptop.' }
  ];

  return (
    <div className="min-h-screen">
      <BlogPageSEO 
        title="Laptop Hunter Blog - Expert Reviews, Comparisons & Guides"
        description="Find expert laptop insights, reviews, and guides to help you make the perfect laptop purchase decision. Browse top 10 lists, detailed reviews, and how-to guides."
        url={currentUrl}
        image="/og-image.png"
      />
      
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Laptop Hunter Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert insights, reviews, and guides to help you find the perfect laptop.
          </p>
        </div>
        
        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map(category => (
            <Link 
              key={category.id} 
              to={`/blog/${category.id}`}
              className="block"
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600">{category.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Browse {category.name}</Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
        
        <Separator className="my-12" />
        
        {/* Recent Posts */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recent Articles</h2>
          
          {loading ? (
            <div className="text-center py-12">Loading recent posts...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">Error loading posts</div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No posts published yet.</p>
              <p className="text-gray-500">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <Card key={post.id} className="flex flex-col hover:shadow-md transition-shadow h-full">
                  {post.image_url && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="flex-grow">
                    <CardTitle className="line-clamp-2 mb-2">{post.title}</CardTitle>
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(post.created_at).toLocaleDateString()}
                      {' · '}
                      {post.category === 'Top10' ? 'Top 10' : post.category === 'How-To' ? 'How-To Guide' : post.category}
                    </div>
                    <p className="text-gray-600 line-clamp-3 text-sm">{post.excerpt}</p>
                  </CardHeader>
                  <CardFooter>
                    <Link to={`/blog/${post.category}/post/${post.slug}`} className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-green-500 hover:text-white hover:border-green-500"
                      >
                        Read Article
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {recentPosts.length > 0 && (
            <div className="text-center mt-8">
              <Link to="/blog">
                <Button>View All Articles</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;

