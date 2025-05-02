
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  isGenerating: boolean;
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isGenerating, progress }) => {
  if (!isGenerating) return null;
  
  return (
    <div className="w-full mt-2">
      <Progress 
        value={progress}
        className="h-1.5"
      />
      <p className="text-sm text-gray-500 mt-1 text-center">
        Analyzing content and generating smart flashcards... {Math.round(progress)}%
      </p>
    </div>
  );
};

export default ProgressBar;
