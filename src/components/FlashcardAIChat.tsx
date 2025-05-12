
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useFlashcards } from '@/context/FlashcardContext';
import { useFlashcardOperations } from '@/hooks/useFlashcardOperations';
import { API_CONFIGURATION } from './pdf-uploader/services/api-config';

// Import our new components
import ChatHeader from './ai-chat/ChatHeader';
import ChatMessageList from './ai-chat/ChatMessageList';
import ChatInput from './ai-chat/ChatInput';
import ApiSettingsDialog from './ai-chat/ApiSettingsDialog';
import ImportFlashcardsDialog from './ai-chat/ImportFlashcardsDialog';

// Import AI services
import { 
  simulateAIResponse, 
  callOpenAI, 
  callAnthropic, 
  callPerplexity, 
  callGemini,
  extractFlashcardsFromText 
} from './ai-chat/aiChatService';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface FlashcardAIChatProps {
  onClose?: () => void;
}

const FlashcardAIChat: React.FC<FlashcardAIChatProps> = ({ onClose }) => {
  const { flashcards } = useFlashcards();
  const flashcardOps = useFlashcardOperations();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'I am an AI assistant specialized in helping you learn with your flashcards. Ask me anything about your flashcards or how to improve your learning.'
    },
    {
      role: 'assistant',
      content: 'Hello! I can help you with your flashcards. What would you like to know?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'openai' | 'anthropic' | 'perplexity' | 'gemini'>('openai');
  const [apiModel, setApiModel] = useState('gpt-4o-mini');
  const [extractedFlashcards, setExtractedFlashcards] = useState<Array<{front: string; back: string; category?: string}>>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const { toast } = useToast();

  const handleImportFlashcards = () => {
    if (extractedFlashcards.length > 0) {
      flashcardOps.createFlashcardsFromBatch(extractedFlashcards);
      toast({
        title: "Flashcards imported",
        description: `Successfully imported ${extractedFlashcards.length} flashcards`,
      });
      setExtractedFlashcards([]);
      setShowImportDialog(false);
    }
  };

  const handleSendMessage = async (inputMessage: string) => {
    // Check if API key is available
    if (!API_CONFIGURATION.hasApiKey && !API_CONFIGURATION.useSimulationMode) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key in the AI settings before sending messages.",
        variant: "destructive"
      });
      setIsApiDialogOpen(true);
      return;
    }
    
    const userMessage: Message = {
      role: 'user',
      content: inputMessage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      let response: string;
      
      // Use the selected AI service
      if (API_CONFIGURATION.useSimulationMode) {
        // Simulate AI response if simulation mode is enabled
        response = await simulateAIResponse(userMessage.content, messages, flashcards);
      } else {
        // Use the selected AI service with the provided API key
        switch (selectedModel) {
          case 'openai':
            API_CONFIGURATION.model = apiModel;
            response = await callOpenAI(userMessage.content, messages, flashcards);
            break;
          case 'anthropic':
            API_CONFIGURATION.model = apiModel;
            response = await callAnthropic(userMessage.content, messages, flashcards);
            break;
          case 'perplexity':
            API_CONFIGURATION.model = apiModel;
            response = await callPerplexity(userMessage.content, messages, flashcards);
            break;
          case 'gemini':
            API_CONFIGURATION.model = apiModel;
            response = await callGemini(userMessage.content, messages, flashcards);
            break;
          default:
            response = await simulateAIResponse(userMessage.content, messages, flashcards);
        }
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Check if the message contains potential flashcards
      const newFlashcards = extractFlashcardsFromText(response);
      if (newFlashcards.length > 0) {
        setExtractedFlashcards(newFlashcards);
        setShowImportDialog(true);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Failed to get a response from the AI service.",
        variant: "destructive"
      });
      
      // Add error message from assistant
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again or check your API settings."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ChatHeader 
        onSettingsClick={() => setIsApiDialogOpen(true)} 
        onClose={onClose} 
      />
      
      <ChatMessageList 
        messages={messages}
        isLoading={isLoading}
      />
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
      
      <ApiSettingsDialog
        isOpen={isApiDialogOpen}
        onOpenChange={setIsApiDialogOpen}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        apiModel={apiModel}
        setApiModel={setApiModel}
      />
      
      <ImportFlashcardsDialog
        isOpen={showImportDialog}
        onOpenChange={setShowImportDialog}
        flashcards={extractedFlashcards}
        onImport={handleImportFlashcards}
      />
    </div>
  );
};

export default FlashcardAIChat;
