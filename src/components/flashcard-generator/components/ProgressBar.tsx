
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  isGenerating: boolean;
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isGenerating, progress }) => {
  if (!isGenerating) return null;
  
  return (
    <div className="w-full mt-2">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 mt-1 text-center">
        Analyzing content and generating smart flashcards...
      </p>
    </div>
  );
};

export default ProgressBar;
