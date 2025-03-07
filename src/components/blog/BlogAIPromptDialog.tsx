
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BlogAIPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, category: string, asin?: string, asin2?: string) => void;
  isLoading: boolean;
}

export function BlogAIPromptDialog({
  isOpen,
  onClose,
  onGenerate,
  isLoading
}: BlogAIPromptDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Review');
  const [asin, setAsin] = useState('');
  const [asin2, setAsin2] = useState('');
  const [showAsinField, setShowAsinField] = useState(false);
  const [showAsin2Field, setShowAsin2Field] = useState(false);

  useEffect(() => {
    // Show ASIN field for Review category
    setShowAsinField(category === 'Review' || category === 'Comparison');
    // Show second ASIN field only for Comparison category
    setShowAsin2Field(category === 'Comparison');
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(
        prompt.trim(), 
        category, 
        showAsinField ? asin : undefined, 
        showAsin2Field ? asin2 : undefined
      );
    }
  };

  const getPromptPlaceholder = () => {
    switch (category) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Generate Blog Content with AI</DialogTitle>
          <DialogDescription>
            Describe what you'd like to write about, and our AI will generate a draft for you to edit.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="category">Post Category</Label>
            <Select
              value={category}
              onValueChange={setCategory}
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
                {category === 'Comparison' ? 'First Laptop ASIN' : 'Amazon ASIN'} 
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
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
            {category === 'How-To' && (
              <p className="text-xs text-gray-500 mt-1">
                Include specific questions you want answered in your guide. This helps the AI create more targeted content.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!prompt.trim() || isLoading}>
              {isLoading ? 'Generating...' : 'Generate Content'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
