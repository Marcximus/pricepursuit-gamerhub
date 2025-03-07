
import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Save, Eye, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlog, type BlogPost } from '@/contexts/BlogContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { generateBlogPost } from '@/services/blogService';
import { toast } from '@/components/ui/use-toast';
import { BlogAIPromptDialog } from '@/components/blog/BlogAIPromptDialog';

const INITIAL_POST_STATE: Omit<BlogPost, 'id' | 'created_at'> = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  category: 'Review',
  author: '',
  published: false,
  tags: [],
};

const NewBlogPost = () => {
  const { user, isAdmin } = useAuth();
  const { posts, createPost, updatePost } = useBlog();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [post, setPost] = useState<Omit<BlogPost, 'id' | 'created_at'>>(INITIAL_POST_STATE);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>('');
  const [isAIDialogOpen, setIsAIDialogOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    document.title = editMode ? "Edit Blog Post | Laptop Hunter" : "Create Blog Post | Laptop Hunter";
    
    // Check if we're in edit mode
    const searchParams = new URLSearchParams(location.search);
    const editPostId = searchParams.get('edit');
    
    if (editPostId) {
      const postToEdit = posts.find(p => p.id === editPostId);
      if (postToEdit) {
        const { id, created_at, ...postData } = postToEdit;
        setPost(postData);
        setEditMode(true);
        setEditId(id);
      }
    } else {
      // Set current user as author
      if (user && user.email) {
        setPost(prev => ({ ...prev, author: user.email!.split('@')[0] }));
      }
    }
  }, [location.search, posts, user]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/blog/new' } });
    } else if (!isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setPost(prev => ({
      ...prev,
      title: newTitle,
      slug: generateSlug(newTitle)
    }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setPost(prev => ({ ...prev, content: newContent }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !post.tags?.includes(tagInput.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleGenerateWithAI = async (prompt: string, category: string) => {
    setIsGenerating(true);
    setIsAIDialogOpen(false);
    
    try {
      toast({
        title: "Generating blog post",
        description: "Please wait while we generate your content...",
      });
      
      const generatedContent = await generateBlogPost(prompt, category);
      
      if (generatedContent) {
        setPost(prev => ({
          ...prev,
          title: generatedContent.title || prev.title,
          content: generatedContent.content || prev.content,
          excerpt: generatedContent.excerpt || prev.excerpt,
          category: generatedContent.category as any || prev.category,
          slug: generateSlug(generatedContent.title || prev.title),
          tags: generatedContent.tags || prev.tags,
        }));
        
        toast({
          title: "Content generated successfully",
          description: "Your AI-generated content is ready to edit!",
        });
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error generating content",
        description: "There was a problem generating your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!post.title || !post.content || !post.excerpt || !post.author) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before saving.",
        variant: "destructive",
      });
      return;
    }

    if (editMode && editId) {
      const success = await updatePost(editId, post);
      if (success) {
        navigate(`/blog/admin`);
      }
    } else {
      const newPost = await createPost(post);
      if (newPost) {
        navigate(`/blog/admin`);
      }
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/blog/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {editMode ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsAIDialogOpen(true)}
              disabled={isGenerating}
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save {post.published ? 'Published Post' : 'Draft'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue={isPreviewMode ? "preview" : "edit"} value={isPreviewMode ? "preview" : "edit"}>
              <TabsList className="mb-4">
                <TabsTrigger value="edit" onClick={() => setIsPreviewMode(false)}>
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" onClick={() => setIsPreviewMode(true)}>
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title*</Label>
                  <Input
                    id="title"
                    placeholder="Enter blog post title"
                    value={post.title}
                    onChange={handleTitleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL friendly version of title)</Label>
                  <Input
                    id="slug"
                    placeholder="your-blog-post-title"
                    value={post.slug}
                    onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt* (Short summary for previews)</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Enter a brief summary of your article"
                    rows={3}
                    value={post.excerpt}
                    onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content*</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your blog post content here. HTML is supported for formatting."
                    rows={20}
                    value={post.content}
                    onChange={handleContentChange}
                    className="font-mono"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-8">
                <article className="prose prose-lg max-w-none">
                  <h1>{post.title || 'Untitled Blog Post'}</h1>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 not-prose mb-4">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-gray-500 text-sm mb-8">
                    By {post.author || 'Unknown'} | {new Date().toLocaleDateString()}
                  </div>
                  
                  {post.content ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  ) : (
                    <p className="text-gray-400 italic">No content yet. Start writing to see the preview.</p>
                  )}
                </article>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="author">Author*</Label>
                <Input
                  id="author"
                  placeholder="Your name"
                  value={post.author}
                  onChange={(e) => setPost(prev => ({ ...prev, author: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Select
                  value={post.category}
                  onValueChange={(value) => setPost(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Top10">Top 10 Lists</SelectItem>
                    <SelectItem value="Review">Reviews</SelectItem>
                    <SelectItem value="Comparison">Comparisons</SelectItem>
                    <SelectItem value="How-To">How-To Guides</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Featured Image URL</Label>
                <Input
                  id="image_url"
                  placeholder="https://example.com/image.jpg"
                  value={post.image_url || ''}
                  onChange={(e) => setPost(prev => ({ ...prev, image_url: e.target.value }))}
                />
                {post.image_url && (
                  <div className="mt-2">
                    <img 
                      src={post.image_url} 
                      alt="Featured" 
                      className="w-full h-auto rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button variant="outline" type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.tags.map((tag, idx) => (
                      <div key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center">
                        {tag}
                        <button
                          type="button"
                          className="ml-1 text-gray-500 hover:text-gray-800"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="published"
                  checked={post.published}
                  onCheckedChange={(checked) => setPost(prev => ({ ...prev, published: checked }))}
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Publishing Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use clear, descriptive titles</li>
                <li>• Break content into sections with headings</li>
                <li>• Include relevant images where helpful</li>
                <li>• Use HTML for formatting (<code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>, etc.)</li>
                <li>• Add tags to improve searchability</li>
                <li>• Write a concise, engaging excerpt</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <BlogAIPromptDialog 
        isOpen={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        onGenerate={handleGenerateWithAI}
        isLoading={isGenerating}
      />
    </div>
  );
};

export default NewBlogPost;
