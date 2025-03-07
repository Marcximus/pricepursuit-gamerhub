
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBlog } from '@/contexts/BlogContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { BlogAIPromptDialog } from '@/components/blog/BlogAIPromptDialog';
import { uploadBlogImage, generateBlogPost } from '@/services/blogService';
import { Sparkles, Image, Eye, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

const NewBlogPost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, createPost, updatePost, getPostBySlug } = useBlog();
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get edit ID from query params if available
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('edit');
  
  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<'Top10' | 'Review' | 'Comparison' | 'How-To'>('Review');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('Laptop Hunter Team');
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  
  // Load post data if in edit mode
  useEffect(() => {
    if (editId) {
      const postToEdit = posts.find(post => post.id === editId);
      if (postToEdit) {
        setTitle(postToEdit.title);
        setSlug(postToEdit.slug);
        setContent(postToEdit.content);
        setExcerpt(postToEdit.excerpt);
        setCategory(postToEdit.category);
        setImageUrl(postToEdit.image_url || '');
        setAuthor(postToEdit.author);
        setPublished(postToEdit.published);
        setTags(postToEdit.tags || []);
        setTagsInput(postToEdit.tags?.join(', ') || '');
        
        document.title = `Edit: ${postToEdit.title} | Laptop Hunter Blog`;
      }
    } else {
      document.title = "New Blog Post | Laptop Hunter Blog";
    }
  }, [editId, posts]);
  
  // Generate a slug from the title
  useEffect(() => {
    if (title && !editId) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  }, [title, editId]);
  
  // Handle tag input changes
  const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    setTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag));
  };
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const url = await uploadBlogImage(file);
      if (url) {
        setImageUrl(url);
        toast({
          title: "Image uploaded",
          description: "Your image has been uploaded successfully.",
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle AI content generation
  const handleGenerateContent = async (prompt: string, selectedCategory: string) => {
    setIsGenerating(true);
    try {
      const generatedContent = await generateBlogPost(prompt, selectedCategory);
      
      if (generatedContent) {
        setTitle(generatedContent.title);
        setContent(generatedContent.content);
        setExcerpt(generatedContent.excerpt);
        setCategory(generatedContent.category as any);
        if (generatedContent.tags) {
          setTags(generatedContent.tags);
          setTagsInput(generatedContent.tags.join(', '));
        }
        
        toast({
          title: "Content generated",
          description: "AI-generated content is ready for your review.",
        });
      }
      
      setIsAIPromptOpen(false);
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating content.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save the blog post
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !slug || !content || !excerpt || !category) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if the slug already exists (and is not the current post)
    const existingPost = getPostBySlug(slug, category);
    if (existingPost && existingPost.id !== editId) {
      toast({
        title: "Slug already exists",
        description: "A post with this slug already exists in this category. Please use a different slug.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const postData = {
        title,
        slug,
        content,
        excerpt,
        category,
        image_url: imageUrl || undefined,
        author,
        published,
        tags: tags.length > 0 ? tags : undefined,
      };
      
      let success;
      if (editId) {
        success = await updatePost(editId, postData);
      } else {
        const newPost = await createPost(postData);
        success = !!newPost;
      }
      
      if (success) {
        toast({
          title: editId ? "Post updated" : "Post created",
          description: editId 
            ? "Your blog post has been updated successfully." 
            : "Your blog post has been created successfully.",
        });
        navigate(published ? `/blog/${category}/post/${slug}` : '/blog/admin');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your post.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {editId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAIPromptOpen(true)}
              className="flex items-center"
            >
              <Sparkles className="mr-2 h-4 w-4" /> 
              Generate with AI
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(`/blog/${category}/post/${slug}`, '_blank')}
              disabled={!title || !slug || !content}
              className="flex items-center"
            >
              <Eye className="mr-2 h-4 w-4" /> 
              Preview
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Enter post title" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content*</Label>
                <Tabs defaultValue="write">
                  <TabsList className="mb-2">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write">
                    <Textarea 
                      id="content" 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      placeholder="Write your blog post content here (HTML formatting supported)" 
                      className="min-h-[400px]" 
                      required
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="border rounded-md p-4 min-h-[400px] prose max-w-none">
                      {content ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                      ) : (
                        <p className="text-gray-400">No content to preview</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt*</Label>
                <Textarea 
                  id="excerpt" 
                  value={excerpt} 
                  onChange={(e) => setExcerpt(e.target.value)} 
                  placeholder="Brief summary of the post (2-3 sentences)" 
                  rows={3} 
                  required
                />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="published">Published</Label>
                    <Switch 
                      id="published" 
                      checked={published} 
                      onCheckedChange={setPublished} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category*</Label>
                    <Select 
                      value={category} 
                      onValueChange={(value: 'Top10' | 'Review' | 'Comparison' | 'How-To') => setCategory(value)}
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
                    <Label htmlFor="slug">Slug*</Label>
                    <Input 
                      id="slug" 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, '-'))} 
                      placeholder="post-url-slug" 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Author*</Label>
                    <Input 
                      id="author" 
                      value={author} 
                      onChange={(e) => setAuthor(e.target.value)} 
                      placeholder="Author name" 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input 
                      id="tags" 
                      value={tagsInput} 
                      onChange={handleTagsInputChange}
                      placeholder="tag1, tag2, tag3" 
                    />
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, i) => (
                          <span key={i} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Featured Image</Label>
                    <div className="flex flex-col space-y-2">
                      <label 
                        htmlFor="image-upload" 
                        className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 transition-colors"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Image className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {isUploading ? 'Uploading...' : 'Click to upload an image'}
                          </span>
                        </div>
                      </label>
                      <input 
                        id="image-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </div>
                    {imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={imageUrl} 
                          alt="Featured image" 
                          className="rounded-md max-h-[200px] w-auto mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/blog/admin')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving || !title || !slug || !content || !excerpt}
                  className="flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : editId ? 'Update Post' : 'Save Post'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <BlogAIPromptDialog 
        isOpen={isAIPromptOpen}
        onClose={() => setIsAIPromptOpen(false)}
        onGenerate={handleGenerateContent}
        isLoading={isGenerating}
      />
    </div>
  );
};

export default NewBlogPost;
