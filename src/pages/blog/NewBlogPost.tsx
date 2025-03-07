
import { useEffect } from 'react';
import { useNewBlogPost } from '@/components/blog/newPost/useNewBlogPost';
import Navigation from '@/components/Navigation';
import { PostContent } from '@/components/blog/newPost/PostContent';
import { PostMetadata } from '@/components/blog/newPost/PostMetadata';
import { PostActions, PostHeaderActions } from '@/components/blog/newPost/PostActions';
import { BlogAIPromptDialog } from '@/components/blog/BlogAIPromptDialog';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NewBlogPost = () => {
  const {
    title,
    content,
    excerpt,
    tagsInput,
    isAIPromptOpen,
    isGenerating,
    isSaving,
    editId,
    previewPost,
    currentUrl,
    isValid,
    category,
    
    setTitle,
    setContent,
    setExcerpt,
    setIsAIPromptOpen,
    
    handleTagsInputChange,
    handleMetadataChange,
    handleOpenAIPrompt,
    handlePreview,
    handleCancel,
    handleGenerateContent,
    handleSave
  } = useNewBlogPost();
  
  // Automatically open the AI dialog when the page loads and there's no content yet
  useEffect(() => {
    if (!title && !content && !excerpt && !editId) {
      setIsAIPromptOpen(true);
    }
  }, [title, content, excerpt, editId, setIsAIPromptOpen]);
  
  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {editId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleOpenAIPrompt} 
              variant="default"
              className="flex items-center gap-2"
              disabled={isGenerating}
            >
              <Sparkles className="h-5 w-5" />
              {isGenerating ? 'Generating...' : content ? 'Regenerate with AI' : 'Generate with AI'}
            </Button>
            
            {content && (
              <PostHeaderActions 
                onPreview={handlePreview}
                isValid={isValid}
              />
            )}
          </div>
        </div>
        
        {!content && !title ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-xl mx-auto">
            <Sparkles className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Start by generating AI content</h2>
            <p className="text-muted-foreground mb-6">All blog posts at Laptop Hunter are created with AI - tell us what you'd like to write about, and we'll generate a draft for you to edit.</p>
            <Button 
              onClick={handleOpenAIPrompt} 
              size="lg"
              className="flex items-center gap-2"
              disabled={isGenerating}
            >
              <Sparkles className="h-5 w-5" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="content" className="flex-1 max-w-[200px]">Content</TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 max-w-[200px]">Settings & SEO</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-6">
                <div className="space-y-8">
                  <PostContent 
                    title={title}
                    content={content}
                    excerpt={excerpt}
                    onTitleChange={(e) => setTitle(e.target.value)}
                    onContentChange={(e) => setContent(e.target.value)}
                    onExcerptChange={(e) => setExcerpt(e.target.value)}
                    category={category}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => document.querySelector('[data-value="settings"]')?.click()}
                      type="button"
                      className="mt-4"
                    >
                      Continue to Settings
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <PostMetadata 
                      post={previewPost}
                      onChange={handleMetadataChange}
                      tagsInput={tagsInput}
                      onTagsInputChange={handleTagsInputChange}
                    />
                  </div>
                  
                  <div>
                    <PostActions 
                      isSaving={isSaving}
                      previewPost={previewPost}
                      currentUrl={currentUrl}
                      onSave={handleSave}
                      onOpenAIPrompt={handleOpenAIPrompt}
                      onPreview={handlePreview}
                      onCancel={handleCancel}
                      isEdit={!!editId}
                      isValid={isValid}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        )}
      </div>
      
      <BlogAIPromptDialog 
        isOpen={isAIPromptOpen}
        onClose={() => setIsAIPromptOpen(false)}
        onGenerate={handleGenerateContent}
        isLoading={isGenerating}
        defaultOpen={!title && !content && !excerpt && !editId}
      />
    </div>
  );
};

export default NewBlogPost;
