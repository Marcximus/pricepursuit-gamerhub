
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AIGenerationPanelProps {
  isGenerating: boolean;
  prompt: string;
  setPrompt: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  asin: string;
  setAsin: (value: string) => void;
  asin2: string;
  setAsin2: (value: string) => void;
  handleGenerateContent: () => void;
}

export const AIGenerationPanel = ({
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
}: AIGenerationPanelProps) => {
  const [showAsinField, setShowAsinField] = useState(false);
  const [showAsin2Field, setShowAsin2Field] = useState(false);

  useEffect(() => {
    // Show ASIN field for Review category
    setShowAsinField(selectedCategory === 'Review' || selectedCategory === 'Comparison');
    // Show second ASIN field only for Comparison category
    setShowAsin2Field(selectedCategory === 'Comparison');
  }, [selectedCategory]);

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

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate with AI
        </CardTitle>
        <CardDescription>
          Describe what you'd like to write about, and our AI will generate a draft for you to edit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Post Category</Label>
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
        </div>
        
        {showAsinField && (
          <div className="space-y-2">
            <Label htmlFor="asin">
              {selectedCategory === 'Comparison' ? 'First Laptop ASIN' : 'Amazon ASIN'} 
              <span className="ml-1 text-xs text-gray-500">
                - The AI will fetch product details
              </span>
            </Label>
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
            <Label htmlFor="asin2">
              Second Laptop ASIN
              <span className="ml-1 text-xs text-gray-500">
                - The AI will fetch product details for comparison
              </span>
            </Label>
            <Input
              id="asin2"
              placeholder="e.g., B09KS19HZ1"
              value={asin2}
              onChange={(e) => setAsin2(e.target.value)}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="prompt">Your Request</Label>
          <Textarea
            id="prompt"
            placeholder={getPromptPlaceholder()}
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          {selectedCategory === 'How-To' && (
            <p className="text-xs text-gray-500 mt-1">
              Include specific questions you want answered in your guide. This helps the AI create more targeted content.
            </p>
          )}
        </div>
        
        <Button
          onClick={handleGenerateContent}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
