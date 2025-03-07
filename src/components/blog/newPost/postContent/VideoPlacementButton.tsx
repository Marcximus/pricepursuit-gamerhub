
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoPlacementButtonProps {
  onAddVideoPlacement: () => void;
  videoPlacement: boolean;
}

export const VideoPlacementButton = ({ onAddVideoPlacement, videoPlacement }: VideoPlacementButtonProps) => {
  return (
    <button 
      type="button"
      onClick={onAddVideoPlacement}
      disabled={videoPlacement}
      className="text-xs text-blue-600 hover:text-blue-800 flex items-center disabled:text-gray-400 disabled:cursor-not-allowed"
    >
      + Add Video Placement
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 ml-1" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">Adds a video player placeholder at the end of your post</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </button>
  );
};
