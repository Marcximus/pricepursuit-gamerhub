
import { Button } from '@/components/ui/button';
import { Eye, Save } from 'lucide-react';

interface HeaderActionsProps {
  showPreview: boolean;
  isValid: boolean;
  isSaving: boolean;
  editId: string | null;
  onTogglePreview: () => void;
  onSave: (e: React.FormEvent) => void;
}

export const HeaderActions = ({
  showPreview,
  isValid,
  isSaving,
  editId,
  onTogglePreview,
  onSave
}: HeaderActionsProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={showPreview ? "default" : "outline"} 
        onClick={onTogglePreview}
        disabled={!isValid}
        className="flex items-center"
      >
        <Eye className="mr-2 h-4 w-4" /> 
        {showPreview ? "Edit Mode" : "Preview"}
      </Button>
      
      <Button 
        onClick={onSave}
        disabled={isSaving || !isValid}
        className="flex items-center"
      >
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? 'Saving...' : editId ? 'Update Post' : 'Save Post'}
      </Button>
    </div>
  );
};
