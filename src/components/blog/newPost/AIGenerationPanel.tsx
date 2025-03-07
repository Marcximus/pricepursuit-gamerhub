
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIGenerationPanelProps {
  isGenerating: boolean;
  handleGenerateContent: (prompt: string, category: string, asin?: string, asin2?: string) => void;
  onRegenerateWithAI?: () => void;
  category?: string;
  hasContent: boolean;
}

export const AIGenerationPanel = ({ 
  isGenerating, 
  handleGenerateContent, 
  onRegenerateWithAI,
  category: initialCategory,
  hasContent
}: AIGenerationPanelProps) => {
  // Initialize AI generation form state
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'Review');
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">AI Generation</h2>
      
      <form onSubmit={handleGenerate} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category" className="font-medium">Post Category*</Label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full">
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
              <Label htmlFor="asin" className="font-medium">
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
              <Label htmlFor="asin2" className="font-medium">Second Laptop ASIN</Label>
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
          <Label htmlFor="prompt" className="font-medium">Your Request*</Label>
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
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tips for {selectedCategory} Posts</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          {renderTips()}
        </CardContent>
      </Card>

      {/* Add Regenerate with AI button for convenience */}
      {hasContent && onRegenerateWithAI && (
        <Button 
          type="button" 
          onClick={onRegenerateWithAI}
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Regenerate with AI
        </Button>
      )}
    </div>
  );
};
