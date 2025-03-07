
import { useNewBlogPost } from '@/components/blog/newPost/useNewBlogPost';
import Navigation from '@/components/Navigation';
import { PostContent } from '@/components/blog/newPost/PostContent';
import { PostMetadata } from '@/components/blog/newPost/PostMetadata';
import { PostActions, PostHeaderActions } from '@/components/blog/newPost/PostActions';

const NewBlogPost = () => {
  const {
    title,
    content,
    excerpt,
    tagsInput,
    isGenerating,
    isSaving,
    editId,
    previewPost,
    currentUrl,
    isValid,
    category,
    
    // AI generation state
    prompt,
    setPrompt,
    selectedCategory,
    setSelectedCategory,
    asin,
    setAsin,
    asin2,
    setAsin2,
    
    setTitle,
    setContent,
    setExcerpt,
    
    handleTagsInputChange,
    handleMetadataChange,
    handlePreview,
    handleCancel,
    handleGenerateContent,
    handleSave
  } = useNewBlogPost();
  
  const aiGeneration = {
    isGenerating,
    prompt,
    setPrompt,
    selectedCategory,
    setSelectedCategory,
    asin,
    setAsin,
    asin2,
    setAsin2,
    handleGenerateContent
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {editId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <PostHeaderActions 
            onPreview={handlePreview}
            isValid={isValid}
          />
        </div>
        
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <PostContent 
                title={title}
                content={content}
                excerpt={excerpt}
                onTitleChange={(e) => setTitle(e.target.value)}
                onContentChange={(e) => setContent(e.target.value)}
                onExcerptChange={(e) => setExcerpt(e.target.value)}
                category={category}
                aiGeneration={aiGeneration}
              />
            </div>
            
            <div className="space-y-6">
              <PostMetadata 
                post={previewPost}
                onChange={handleMetadataChange}
                tagsInput={tagsInput}
                onTagsInputChange={handleTagsInputChange}
              />
              
              <PostActions 
                isSaving={isSaving}
                previewPost={previewPost}
                currentUrl={currentUrl}
                onSave={handleSave}
                onOpenAIPrompt={() => {}} 
                onPreview={handlePreview}
                onCancel={handleCancel}
                isEdit={!!editId}
                isValid={isValid}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBlogPost;
