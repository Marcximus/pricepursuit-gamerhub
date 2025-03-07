
import { useState } from 'react';
import { useNewBlogPost } from '@/components/blog/newPost/useNewBlogPost';
import Navigation from '@/components/Navigation';
import { toast } from '@/components/ui/use-toast';
import { HeaderActions } from '@/components/blog/newPost/HeaderActions';
import { AIGenerationPanel } from '@/components/blog/newPost/AIGenerationPanel';
import { PreviewMode } from '@/components/blog/newPost/PreviewMode';
import { EmptyContentState } from '@/components/blog/newPost/EmptyContentState';
import { EditMode } from '@/components/blog/newPost/EditMode';

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
    imageUrl,
    
    setTitle,
    setContent,
    setExcerpt,
    
    handleTagsInputChange,
    handleMetadataChange,
    handleGenerateContent,
    handlePreview,
    handleCancel,
    handleSave
  } = useNewBlogPost();
  
  const [showPreview, setShowPreview] = useState(false);
  
  // Handle toggling preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);
    toast({
      title: showPreview ? "Edit Mode" : "Preview Mode",
      description: showPreview ? "Now you can edit your post." : "Previewing how your post will look.",
    });
  };

  // Handle regenerate with AI
  const handleRegenerateWithAI = () => {
    toast({
      title: "Regenerate Content",
      description: "Modify your prompt and click 'Generate Blog Content' to regenerate.",
    });
    // Scroll to the top of the AI generation form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      
      <div className="container mx-auto px-4 mt-4 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {editId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          
          {content && (
            <HeaderActions 
              showPreview={showPreview}
              isValid={isValid}
              isSaving={isSaving}
              editId={editId}
              onTogglePreview={togglePreview}
              onSave={handleSave}
            />
          )}
        </div>
        
        {showPreview ? (
          // Preview Mode
          <PreviewMode 
            title={title}
            content={content}
            excerpt={excerpt}
            imageUrl={imageUrl}
            onExitPreview={togglePreview}
          />
        ) : (
          // Edit Mode
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* AI Generation - Left Section */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 self-start bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <AIGenerationPanel 
                isGenerating={isGenerating}
                handleGenerateContent={handleGenerateContent}
                onRegenerateWithAI={handleRegenerateWithAI}
                category={category}
                hasContent={!!content}
              />
            </div>
            
            {/* Content and Settings - Right Section */}
            <div className="lg:col-span-8">
              {!content ? (
                <EmptyContentState />
              ) : (
                <EditMode 
                  title={title}
                  content={content}
                  excerpt={excerpt}
                  onTitleChange={(e) => setTitle(e.target.value)}
                  onContentChange={(e) => setContent(e.target.value)}
                  onExcerptChange={(e) => setExcerpt(e.target.value)}
                  category={category}
                  previewPost={previewPost}
                  tagsInput={tagsInput}
                  handleTagsInputChange={handleTagsInputChange}
                  handleMetadataChange={handleMetadataChange}
                  onRegenerateWithAI={handleRegenerateWithAI}
                  onSave={handleSave}
                  onPreview={handlePreview}
                  onCancel={handleCancel}
                  isSaving={isSaving}
                  currentUrl={currentUrl}
                  editId={editId}
                  isValid={isValid}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBlogPost;
