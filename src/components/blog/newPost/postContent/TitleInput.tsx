
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface TitleInputProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TitleInput = ({ title, onTitleChange }: TitleInputProps) => {
  // Use local state to track the input value directly
  const [inputValue, setInputValue] = useState(title || '');
  
  // Update local state when parent title changes (e.g., from AI generation)
  useEffect(() => {
    setInputValue(title || '');
  }, [title]);
  
  // Handle input changes locally first, then propagate to parent
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store the raw input value without processing
    setInputValue(e.target.value);
    // Pass the event to parent component
    onTitleChange(e);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="title">Title*</Label>
      <Input 
        id="title" 
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter post title" 
        required
      />
    </div>
  );
};
