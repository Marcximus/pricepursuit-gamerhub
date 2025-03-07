
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBlog } from '@/contexts/BlogContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const getCategoryTitle = (category: string): string => {
  switch (category) {
    case 'Top10': return 'Top 10 Lists';
    case 'Review': return 'Laptop Reviews';
    case 'Comparison': return 'Laptop Comparisons';
    case 'How-To': return 'How-To Guides';
    default: return category;
  }
};

const getCategoryDescription = (category: string): string => {
  switch (category) {
    case 'Top10': 
      return 'Discover the best laptops in various categories with our detailed top 10 lists.';
    case 'Review': 
      return 'In-depth reviews of the latest laptops, helping you make informed decisions.';
    case 'Comparison': 
      return 'Detailed head-to-head comparisons between popular laptop models.';
    case 'How-To': 
      return 'Helpful tutorials and guides to get the most out of your laptop.';
    default: 
      return 'Explore our collection of laptop-related articles.';
  }
};

const BlogCategory = () => {
  const { category } = useParams<{ category: string }>();
  const { loading, error, getPostsByCategory } = useBlog();
  
  const categoryPosts = category ? getPostsByCategory(category) : [];
  
  useEffect(() => {
    if (category) {
      document.title = `${getCategoryTitle(category)} | Laptop Hunter Blog`;
    }
  }, [category]);

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div className="min-h-screen pb-12">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{getCategoryTitle(category)}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {getCategoryDescription(category)}
          </p>
        </div>
        
        <div className="mb-6">
          <Link to="/blog">
            <Button variant="outline">← Back to Blog</Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-12">Loading posts...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">Error loading posts</div>
        ) : categoryPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No articles in this category yet.</p>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                {post.image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription>
                    {new Date(post.created_at).toLocaleDateString()} | By {post.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-gray-600">{post.excerpt}</p>
                </CardContent>
                <CardFooter>
                  <Link to={`/blog/${category}/post/${post.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">Read Article</Button>
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
