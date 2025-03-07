
import { Sparkles } from 'lucide-react';

export const EmptyContentState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <Sparkles className="h-16 w-16 text-primary mb-4" />
      <h2 className="text-2xl font-bold mb-2">Generate Content First</h2>
      <p className="text-muted-foreground mb-6">Use the AI Generation panel to create your blog post content.</p>
    </div>
  );
};
