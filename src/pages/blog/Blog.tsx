
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, GitCompare, HelpCircle } from 'lucide-react';
import { useBlog } from '@/contexts/BlogContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const BlogCategoryCard = ({ 
  title, 
  description, 
  icon, 
  route 
}: { 
  title: string; 
  description: string; 
  icon: JSX.Element; 
  route: string;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <div className="flex items-center space-x-2">
        {icon}
        <CardTitle>{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="min-h-[60px]">{description}</CardDescription>
    </CardContent>
    <CardFooter>
      <Link to={route} className="w-full">
        <Button variant="outline" className="w-full">View Articles</Button>
      </Link>
    </CardFooter>
  </Card>
);

const RecentPostCard = ({ 
  post 
}: { 
  post: any;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle className="line-clamp-2 text-base">{post.title}</CardTitle>
      <CardDescription className="text-xs">{new Date(post.created_at).toLocaleDateString()}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm line-clamp-3">{post.excerpt}</p>
    </CardContent>
    <CardFooter>
      <Link to={`/blog/${post.category}/post/${post.slug}`} className="w-full">
        <Button variant="outline" size="sm" className="w-full">Read More</Button>
      </Link>
    </CardFooter>
  </Card>
);

const Blog = () => {
  const { posts, loading, error, fetchPosts, getRecentPosts } = useBlog();
  
  useEffect(() => {
    document.title = "Blog | Laptop Hunter";
    fetchPosts();
  }, [fetchPosts]);
  
  const recentPosts = getRecentPosts(6);
  
  const categories = [
    {
      title: "Top 10 Lists",
      description: "Discover the best laptops in various categories with our detailed top 10 lists.",
      icon: <BookOpen className="h-5 w-5 text-gaming-600" />,
      route: "/blog/Top10"
    },
    {
      title: "Reviews",
      description: "In-depth reviews of the latest laptops, helping you make informed decisions.",
      icon: <Award className="h-5 w-5 text-gaming-600" />,
      route: "/blog/Review"
    },
    {
      title: "Comparisons",
      description: "Detailed head-to-head comparisons between popular laptop models.",
      icon: <GitCompare className="h-5 w-5 text-gaming-600" />,
      route: "/blog/Comparison"
    },
    {
      title: "How-To Guides",
      description: "Helpful tutorials and guides to get the most out of your laptop.",
      icon: <HelpCircle className="h-5 w-5 text-gaming-600" />,
      route: "/blog/How-To"
    }
  ];

  return (
    <div className="min-h-screen pb-12">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Laptop Hunter Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert advice, reviews, and guides to help you make the best laptop decisions.
          </p>
        </div>
        
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Blog Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <BlogCategoryCard key={index} {...category} />
            ))}
          </div>
        </section>
        
        <Separator className="my-8" />
        
        <section>
          <h2 className="text-2xl font-bold mb-6">Recent Articles</h2>
          {loading ? (
            <div className="text-center py-12">Loading recent posts...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">Error loading posts: {error}</div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No blog posts available yet.</p>
              <p className="text-gray-500">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <RecentPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Blog;
