
import { useEffect, useState } from 'react';
import { useNewBlogPost } from '@/components/blog/newPost/useNewBlogPost';
import Navigation from '@/components/Navigation';
import { PostContent } from '@/components/blog/newPost/PostContent';
import { PostMetadata } from '@/components/blog/newPost/PostMetadata';
import { PostActions, PostHeaderActions } from '@/components/blog/newPost/PostActions';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  
  // Initialize AI generation form state
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'Review');
  const [asin, setAsin] = useState('');
  const [asin2, setAsin2] = useState('');
  
  // Control visibility of ASIN fields based on category
  const showAsinField = selectedCategory === 'Review' || selectedCategory === 'Comparison';
  const showAsin2Field = selectedCategory === 'Comparison';

  // Handle generation form submission
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      handleGenerateContent(
        prompt.trim(), 
        selectedCategory, 
        showAsinField ? asin : undefined, 
        showAsin2Field ? asin2 : undefined
      );
    }
  };
  
  // Get appropriate prompt placeholder based on category
  const getPromptPlaceholder = () => {
    switch (selectedCategory) {
      case 'Top10':
        return "E.g., 'Generate a top 10 list of best budget gaming laptops under $1000 in 2024'";
      case 'Review':
        return showAsinField && asin 
          ? "E.g., 'Write a detailed review focusing on performance and battery life'" 
          : "E.g., 'Write a detailed review of the MacBook Air M2, focusing on performance and battery life'";
      case 'Comparison':
        return showAsinField && asin && asin2
          ? "E.g., 'Compare these laptops focusing on value for money and performance'" 
          : "E.g., 'Compare the Dell XPS 13 and HP Spectre x360, highlighting the key differences for professional users'";
      case 'How-To':
        return "E.g., 'Create a guide on how to optimize a laptop for gaming performance with these questions: What settings should I change? How do I monitor temperatures? How can I improve battery life while gaming?'";
      default:
        return "Describe what you'd like the AI to write about...";
    }
  };

  // Get category description for tooltip
  const getCategoryDescription = () => {
    switch (selectedCategory) {
      case 'Top10':
        return "Create a ranked list of laptops with pros, cons, and recommendations. Great for product roundups.";
      case 'Review':
        return "In-depth analysis of a single laptop with comprehensive details on performance, design, and value.";
      case 'Comparison':
        return "Side-by-side comparison of two laptops, highlighting similarities, differences, and which is better for specific users.";
      case 'How-To':
        return "Step-by-step guides that help users solve problems or learn new skills related to laptops.";
      default:
        return "";
    }
  };

  // Render generation tips based on selected category
  const renderTips = () => {
    switch (selectedCategory) {
      case 'Review':
        return (
          <>
            <p>• Using an ASIN lets the AI pull accurate specs and images</p>
            <p>• Request focus on specific aspects (e.g., "focus on performance for students")</p>
            <p>• Ask for comparisons with similar models</p>
            <p>• Include "pros and cons" in your prompt for balanced reviews</p>
          </>
        );
      case 'Top10':
        return (
          <>
            <p>• Specify a clear target audience (e.g., "for college students")</p>
            <p>• Add price ranges to narrow down recommendations</p>
            <p>• Request specific ranking criteria (e.g., "ranked by battery life")</p>
            <p>• Ask for brief specs for each laptop</p>
          </>
        );
      case 'Comparison':
        return (
          <>
            <p>• Using ASINs ensures accurate comparisons</p>
            <p>• Specify the main aspects to compare (e.g., "focus on display and battery")</p>
            <p>• Request "which is better for X" conclusions</p>
            <p>• Ask for a feature-by-feature breakdown</p>
          </>
        );
      case 'How-To':
        return (
          <>
            <p>• Frame as specific questions to be answered</p>
            <p>• Request step-by-step instructions</p>
            <p>• Ask for common troubleshooting tips</p>
            <p>• Suggest including tips for beginners vs advanced users</p>
          </>
        );
      default:
        return null;
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
          
          {content && (
            <PostHeaderActions 
              onPreview={handlePreview}
              isValid={isValid}
            />
          )}
        </div>
        
        <Tabs defaultValue={content ? "content" : "generate"} className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="generate" className="flex-1 max-w-[200px] flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> 
              AI Generation
            </TabsTrigger>
            <TabsTrigger value="content" className="flex-1 max-w-[200px]">Content</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 max-w-[200px]">Settings & SEO</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Post Category*</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
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
                    <p className="text-xs text-muted-foreground">{getCategoryDescription()}</p>
                  </div>
                  
                  {showAsinField && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="asin">
                          {selectedCategory === 'Comparison' ? 'First Laptop ASIN' : 'Amazon ASIN'} 
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>The AI will fetch product details using this Amazon ASIN (product ID)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="asin"
                        placeholder="e.g., B09JQMJHXY"
                        value={asin}
                        onChange={(e) => setAsin(e.target.value)}
                      />
                    </div>
                  )}

                  {showAsin2Field && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="asin2">Second Laptop ASIN</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>The AI will fetch product details for the second laptop in the comparison</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="asin2"
                        placeholder="e.g., B09KS19HZ1"
                        value={asin2}
                        onChange={(e) => setAsin2(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Your Request*</Label>
                    <Textarea
                      id="prompt"
                      placeholder={getPromptPlaceholder()}
                      rows={6}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      required
                      className="resize-none"
                    />
                    {selectedCategory === 'How-To' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Include specific questions you want answered in your guide. This helps the AI create more targeted content.
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={!prompt.trim() || isGenerating} 
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Blog Content
                      </>
                    )}
                  </Button>
                </form>
                
                {content && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Content Preview</h3>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const contentTab = document.querySelector('[data-value="content"]');
                          if (contentTab instanceof HTMLElement) {
                            contentTab.click();
                          }
                        }}
                      >
                        Edit Content
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                      <h4 className="text-xl font-bold mb-2">{title}</h4>
                      <p className="text-sm text-gray-500 mb-4">{excerpt}</p>
                      <div className="prose prose-sm max-w-none">
                        {content.split('\n\n').slice(0, 3).map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                        {content.split('\n\n').length > 3 && <p className="text-gray-500 italic">... (continued)</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tips for {selectedCategory} Posts</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    {renderTips()}
                  </CardContent>
                </Card>

                {content && (
                  <div className="mt-6">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                          View SEO Preview
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <div className="space-y-5">
                          <h3 className="text-lg font-medium">SEO Preview</h3>
                          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                            <div className="text-blue-600 text-xl hover:underline cursor-pointer truncate">{title}</div>
                            <div className="text-green-700 text-xs">{currentUrl}</div>
                            <div className="text-gray-600 text-sm">{excerpt}</div>
                          </div>
                          <Button 
                            onClick={() => {
                              const settingsTab = document.querySelector('[data-value="settings"]');
                              if (settingsTab instanceof HTMLElement) {
                                settingsTab.click();
                              }
                            }}
                            className="w-full"
                          >
                            Edit SEO Settings
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                )}
                
                {content && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={handlePreview}
                      disabled={!isValid}
                      className="w-full"
                    >
                      Preview Full Post
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            <div className="space-y-8">
              {!content ? (
                <div className="flex flex-col items-center justify-center py-20 text-center max-w-xl mx-auto">
                  <Sparkles className="h-16 w-16 text-primary mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Generate Content First</h2>
                  <p className="text-muted-foreground mb-6">Go to the AI Generation tab to create your blog post content.</p>
                  <Button 
                    onClick={() => {
                      const generateTab = document.querySelector('[data-value="generate"]');
                      if (generateTab instanceof HTMLElement) {
                        generateTab.click();
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    Go to AI Generation
                  </Button>
                </div>
              ) : (
                <>
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
                      onClick={() => {
                        // Find the settings tab trigger and simulate a click
                        const settingsTab = document.querySelector('[data-value="settings"]');
                        if (settingsTab instanceof HTMLElement) {
                          settingsTab.click();
                        }
                      }}
                      type="button"
                      className="mt-4"
                    >
                      Continue to Settings
                    </Button>
                  </div>
                </>
              )}
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
                  onOpenAIPrompt={() => {
                    const generateTab = document.querySelector('[data-value="generate"]');
                    if (generateTab instanceof HTMLElement) {
                      generateTab.click();
                    }
                  }}
                  onPreview={handlePreview}
                  onCancel={handleCancel}
                  isEdit={!!editId}
                  isValid={isValid}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewBlogPost;
