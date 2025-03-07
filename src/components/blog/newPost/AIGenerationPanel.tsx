
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Generate Content with AI</CardTitle>
        <CardDescription>
          Describe what you want to write about and let AI help with content creation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Example: Write a review of the latest gaming laptops under $1000"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isGenerating}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Post Category</Label>
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              disabled={isGenerating}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Top10">Top 10 List</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Comparison">Comparison</SelectItem>
                <SelectItem value="How-To">How-To Guide</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="asin">Primary ASIN (Optional)</Label>
            <Input
              id="asin"
              placeholder="ASIN for product review or comparison"
              value={asin}
              onChange={(e) => setAsin(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          
          {selectedCategory === 'Comparison' && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="asin2">Secondary ASIN (For comparison)</Label>
              <Input
                id="asin2"
                placeholder="ASIN for second product in comparison"
                value={asin2}
                onChange={(e) => setAsin2(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleGenerateContent} 
          disabled={isGenerating || !prompt || !selectedCategory}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Content...
            </>
          ) : (
            'Generate Content'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
