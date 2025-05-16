
import React from 'react';
import { Brain, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onSettingsClick: () => void;
  onClose?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onSettingsClick, onClose }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Flashcard AI Chat Assistant</h2>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onSettingsClick}>
          <Settings className="h-4 w-4 mr-2" />
          AI Settings
        </Button>
        
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
