
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Brain, Send, Loader2, Bot, User, X, Settings, Save, Plus } from 'lucide-react';
import { useFlashcards } from '@/context/FlashcardContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { API_CONFIGURATION } from './pdf-uploader/services/api-config';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFlashcardOperations } from '@/hooks/useFlashcardOperations';

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
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'openai' | 'anthropic' | 'perplexity' | 'gemini'>('openai');
  const [apiModel, setApiModel] = useState('gpt-4o-mini');
  const [newApiKey, setNewApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [extractedFlashcards, setExtractedFlashcards] = useState<Array<{front: string; back: string; category?: string}>>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveApiKey = () => {
    if (newApiKey.trim()) {
      API_CONFIGURATION.OPENAI_API_KEY = newApiKey.trim();
      setNewApiKey('');
      setApiKeySaved(true);
      setTimeout(() => setApiKeySaved(false), 3000);
    }
  };

  const handleClearApiKey = () => {
    API_CONFIGURATION.clearApiKey();
    setNewApiKey('');
    setApiKeySaved(false);
  };

  const extractFlashcardsFromText = (text: string) => {
    // Simple regex to find potential flashcard patterns
    // This is a basic implementation that looks for patterns like "Front: ... Back: ..."
    const flashcardRegex = /(?:Question|Front|Q):\s*([^\n]+)\s*(?:Answer|Back|A):\s*([^\n]+)/gi;
    let match;
    const cards: Array<{front: string; back: string; category?: string}> = [];

    while ((match = flashcardRegex.exec(text)) !== null) {
      cards.push({
        front: match[1].trim(),
        back: match[2].trim()
      });
    }

    // If no matches found with explicit labels, try to analyze paragraph structure
    if (cards.length === 0) {
      const paragraphs = text.split('\n\n').filter(p => p.trim());
      for (let i = 0; i < paragraphs.length - 1; i += 2) {
        // Assume every two paragraphs could be a flashcard pair
        if (paragraphs[i] && paragraphs[i+1] && 
            paragraphs[i].length < 300 && paragraphs[i+1].length < 500) {
          cards.push({
            front: paragraphs[i].trim(),
            back: paragraphs[i+1].trim()
          });
        }
      }
    }

    return cards;
  };

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
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
    setInputMessage('');
    setIsLoading(true);
    
    try {
      let response: any;
      
      // Use the API key from the central configuration
      const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
      
      if (API_CONFIGURATION.useSimulationMode) {
        // Simulate AI response if simulation mode is enabled
        response = await simulateAIResponse(userMessage.content, messages);
      } else {
        // Use the selected AI service with the provided API key
        switch (selectedModel) {
          case 'openai':
            response = await callOpenAI(userMessage.content, messages);
            break;
          case 'anthropic':
            response = await callAnthropic(userMessage.content, messages);
            break;
          case 'perplexity':
            response = await callPerplexity(userMessage.content, messages);
            break;
          case 'gemini':
            response = await callGemini(userMessage.content, messages);
            break;
          default:
            response = await simulateAIResponse(userMessage.content, messages);
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

  // Function to simulate AI response (fallback when no API key is provided)
  const simulateAIResponse = async (message: string, previousMessages: Message[]): Promise<string> => {
    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm your flashcard assistant. How can I help you with your learning today?";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('can you')) {
      return "I can help you with your flashcards in several ways:\n\n1. Explain concepts from your flashcards\n2. Quiz you on your flashcards\n3. Suggest learning strategies\n4. Help you create better flashcards\n\nWhat would you like help with?";
    }
    
    if (lowerMessage.includes('flashcard') && (lowerMessage.includes('create') || lowerMessage.includes('make'))) {
      return "Creating effective flashcards is an art! Here are some tips:\n\n• Keep each card focused on a single concept\n• Use clear, concise language\n• Include examples where helpful\n• For language learning, include context\n• Review your cards regularly using spaced repetition";
    }
    
    if (lowerMessage.includes('learn') || lowerMessage.includes('study') || lowerMessage.includes('remember')) {
      return "The most effective way to study with flashcards is using spaced repetition. Review cards more frequently when you're struggling with them, and less frequently as you master them. Study in short, focused sessions rather than cramming, and make sure to actively recall the information rather than just reading it.";
    }
    
    if (lowerMessage.includes('how many') && lowerMessage.includes('flashcard')) {
      return `You currently have ${flashcards.length} flashcards in your collection.`;
    }
    
    // Default response
    return "I understand you're asking about your flashcards. To give you the most helpful response, could you provide more specific details about what you'd like to know or learn?";
  };

  // Function to call OpenAI API
  const callOpenAI = async (message: string, previousMessages: Message[]): Promise<string> => {
    try {
      const messagesToSend = previousMessages.filter(msg => msg.role !== 'system').slice(-6);
      messagesToSend.push({ role: 'user', content: message });
      
      // Add context about flashcards
      const flashcardContext = flashcards.slice(0, 10).map((card, i) => 
        `Card ${i+1}: Front: "${card.front}" Back: "${card.back}" Category: ${card.category || 'Uncategorized'}`
      ).join('\n');
      
      const systemMessage = {
        role: 'system',
        content: `You are an AI assistant specialized in helping users learn with flashcards. Here are some of the user's flashcards for context:\n\n${flashcardContext}\n\nThe user has a total of ${flashcards.length} flashcards. Provide helpful, educational responses about the content in these flashcards or about learning strategies.`
      };
      
      const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: apiModel || 'gpt-4o-mini',
          messages: [systemMessage, ...messagesToSend],
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error calling OpenAI API');
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  };
  
  // Function to call Anthropic API
  const callAnthropic = async (message: string, previousMessages: Message[]): Promise<string> => {
    try {
      const messagesToSend = previousMessages.filter(msg => msg.role !== 'system').slice(-6);
      messagesToSend.push({ role: 'user', content: message });
      
      // Add context about flashcards
      const flashcardContext = flashcards.slice(0, 10).map((card, i) => 
        `Card ${i+1}: Front: "${card.front}" Back: "${card.back}" Category: ${card.category || 'Uncategorized'}`
      ).join('\n');
      
      const systemMessage = `You are an AI assistant specialized in helping users learn with flashcards. Here are some of the user's flashcards for context:\n\n${flashcardContext}\n\nThe user has a total of ${flashcards.length} flashcards. Provide helpful, educational responses about the content in these flashcards or about learning strategies.`;
      
      const messages = messagesToSend.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
      
      const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: apiModel || 'claude-3-haiku-20240307',
          max_tokens: 1024,
          system: systemMessage,
          messages: messages
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error calling Anthropic API');
      }
      
      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  };
  
  // Function to call Perplexity API
  const callPerplexity = async (message: string, previousMessages: Message[]): Promise<string> => {
    try {
      const messagesToSend = previousMessages.filter(msg => msg.role !== 'system').slice(-6);
      messagesToSend.push({ role: 'user', content: message });
      
      // Add context about flashcards
      const flashcardContext = flashcards.slice(0, 10).map((card, i) => 
        `Card ${i+1}: Front: "${card.front}" Back: "${card.back}" Category: ${card.category || 'Uncategorized'}`
      ).join('\n');
      
      const systemMessage = {
        role: 'system',
        content: `You are an AI assistant specialized in helping users learn with flashcards. Here are some of the user's flashcards for context:\n\n${flashcardContext}\n\nThe user has a total of ${flashcards.length} flashcards. Provide helpful, educational responses about the content in these flashcards or about learning strategies.`
      };
      
      const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: apiModel || 'llama-3.1-sonar-small-128k-online',
          messages: [systemMessage, ...messagesToSend],
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error calling Perplexity API');
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Perplexity API error:', error);
      throw error;
    }
  };
  
  // Function to call Gemini API
  const callGemini = async (message: string, previousMessages: Message[]): Promise<string> => {
    try {
      const messagesToSend = previousMessages.filter(msg => msg.role !== 'system').slice(-6);
      messagesToSend.push({ role: 'user', content: message });
      
      // Add context about flashcards
      const flashcardContext = flashcards.slice(0, 10).map((card, i) => 
        `Card ${i+1}: Front: "${card.front}" Back: "${card.back}" Category: ${card.category || 'Uncategorized'}`
      ).join('\n');
      
      const systemMessage = {
        role: 'system',
        content: `You are an AI assistant specialized in helping users learn with flashcards. Here are some of the user's flashcards for context:\n\n${flashcardContext}\n\nThe user has a total of ${flashcards.length} flashcards.`
        }
      
      const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are an AI assistant specialized in helping users learn with flashcards. Here are some of the user's flashcards for context:\n\n${flashcardContext}\n\nThe user has a total of ${flashcards.length} flashcards.`
                }
              ]
            },
            ...messagesToSend.map(msg => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }]
            }))
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error calling Gemini API');
      }
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Flashcard AI Chat Assistant</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsApiDialogOpen(true)}>
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
      
      <ScrollArea className="flex-grow overflow-auto p-4 bg-slate-50 dark:bg-slate-900/50 min-h-0">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.filter(msg => msg.role !== 'system').map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className={`py-2 px-4 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-full bg-muted">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="py-2 px-4 rounded-lg bg-white dark:bg-slate-800 shadow-sm min-w-[60px] flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t bg-background">
        <div className="flex w-full items-center space-x-2 max-w-3xl mx-auto">
          <Textarea
            placeholder="Ask about your flashcards..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow min-h-[50px] max-h-[100px] resize-none"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputMessage.trim()}
            className="shrink-0"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* API Settings Dialog */}
      <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AI Model Settings</DialogTitle>
            <DialogDescription>
              Configure which AI service and model to use for the chat assistant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-service">AI Service</Label>
              <Select 
                value={selectedModel} 
                onValueChange={(value: any) => setSelectedModel(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Model selection based on provider */}
            {selectedModel === 'openai' && (
              <div className="space-y-2">
                <Label htmlFor="openai-model">OpenAI Model</Label>
                <Select 
                  value={apiModel} 
                  onValueChange={setApiModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedModel === 'anthropic' && (
              <div className="space-y-2">
                <Label htmlFor="anthropic-model">Anthropic Model</Label>
                <Select 
                  value={apiModel} 
                  onValueChange={setApiModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                    <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedModel === 'perplexity' && (
              <div className="space-y-2">
                <Label htmlFor="perplexity-model">Perplexity Model</Label>
                <Select 
                  value={apiModel} 
                  onValueChange={setApiModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llama-3.1-sonar-small-128k-online">Llama 3.1 Sonar (Small)</SelectItem>
                    <SelectItem value="llama-3.1-sonar-large-128k-online">Llama 3.1 Sonar (Large)</SelectItem>
                    <SelectItem value="llama-3.1-sonar-huge-128k-online">Llama 3.1 Sonar (Huge)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedModel === 'gemini' && (
              <div className="space-y-2">
                <Label htmlFor="gemini-model">Gemini Model</Label>
                <Select 
                  value={apiModel} 
                  onValueChange={setApiModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* API Key Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="api-key-input">
                API Key <Lock className="h-4 w-4" />
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Input
                    id="api-key-input"
                    type={showApiKey ? "text" : "password"}
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleSaveApiKey} disabled={!newApiKey.trim()}>Save</Button>
                {API_CONFIGURATION.hasApiKey && (
                  <Button onClick={handleClearApiKey} variant="destructive">Clear</Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Your API key will be stored locally in your browser and never sent to our servers.
              </p>
            </div>
              
            {apiKeySaved && (
              <Alert className="bg-green-50 text-green-800 border-green-500">
                <AlertDescription>API key saved successfully!</AlertDescription>
              </Alert>
            )}
              
            {!API_CONFIGURATION.hasApiKey && !API_CONFIGURATION.useSimulationMode && (
              <Alert className="bg-yellow-50 text-amber-800 border-amber-500">
                <AlertDescription>
                  Please provide an API key to use the AI chat features.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsApiDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Flashcards Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Import AI Generated Flashcards</DialogTitle>
            <DialogDescription>
              The AI has generated {extractedFlashcards.length} potential flashcards. Review them before importing.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow mt-4">
            <div className="space-y-4">
              {extractedFlashcards.map((card, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                  <div className="font-medium mb-2">Card {idx + 1}</div>
                  <div className="mb-2">
                    <Label>Front:</Label>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded mt-1 text-sm">
                      {card.front}
                    </div>
                  </div>
                  <div>
                    <Label>Back:</Label>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded mt-1 text-sm">
                      {card.back}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="border-t pt-4 mt-4">
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportFlashcards} className="ml-2">
              <Save className="h-4 w-4 mr-2" />
              Import Flashcards
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashcardAIChat;
