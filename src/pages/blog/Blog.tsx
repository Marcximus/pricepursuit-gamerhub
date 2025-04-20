
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
    { id: 'Top10', name: 'Top 10 Lists', description: 'Find the best laptops in various categories.', emoji: '🏆' },
    { id: 'Review', name: 'Laptop Reviews', description: 'In-depth reviews of the latest laptops.', emoji: '🔍' },
    { id: 'Comparison', name: 'Laptop Comparisons', description: 'Head-to-head comparisons between popular models.', emoji: '⚖️' },
    { id: 'How-To', name: 'How-To Guides', description: 'Helpful guides to get the most out of your laptop.', emoji: '📘' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogPageSEO 
        title="Laptop Hunter Blog - Expert Reviews, Comparisons & Guides"
        description="Find expert laptop insights, reviews, and guides to help you make the perfect laptop purchase decision. Browse top 10 lists, detailed reviews, and how-to guides."
        url={currentUrl}
        image="/og-image.png"
      />
      
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Laptop Hunter Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Expert insights, reviews, and guides to help you find the perfect laptop.
          </p>
        </div>
        
        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {categories.map(category => (
            <Link 
              key={category.id} 
              to={`/blog/${category.id}`}
              className="block transform transition-all duration-300 hover:-translate-y-2"
            >
              <Card className="h-full overflow-hidden group relative bg-white hover:shadow-xl transition-all duration-300 border-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/50 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  category.id === 'Top10' ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/20' :
                  category.id === 'Review' ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/20' :
                  category.id === 'Comparison' ? 'bg-gradient-to-br from-orange-500/10 to-amber-500/20' :
                  'bg-gradient-to-br from-pink-500/10 to-rose-500/20'
                }`} />
                
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors flex items-center gap-3">
                    <span className="text-3xl">{category.emoji}</span>
                    {category.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10 flex-grow pb-6">
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {category.description}
                  </p>
                </CardContent>
                
                <CardFooter className="relative z-10">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-300"
                  >
                    Browse {category.name}
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
        
        <Separator className="my-16" />
        
        {/* Recent Posts */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Recent Articles</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading recent posts...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">Error loading posts</div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No posts published yet.</p>
              <p className="text-gray-500">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <Card key={post.id} className="flex flex-col h-full transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border-2">
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
          
          {recentPosts.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/blog">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-8">
                  View All Articles
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
