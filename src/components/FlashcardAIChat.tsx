
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFlashcards } from '@/context/FlashcardContext';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const FlashcardAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { flashcards } = useFlashcards();
  const { toast } = useToast();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('flashcard-ai-chat', {
        body: { message: input, flashcards },
      });
      
      if (error) throw new Error(error.message);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response from AI. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[800px]">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Bot className="h-16 w-16 mb-4 text-primary opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Flashcard AI Assistant</h3>
            <p className="text-gray-500 max-w-md">
              Ask me anything about your flashcards, study strategies, or how to learn more effectively!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <Card className={`max-w-[80%] ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}>
                <CardContent className="p-3 text-sm whitespace-pre-wrap">
                  {message.content}
                </CardContent>
              </Card>
              
              {message.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ask about your flashcards..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
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
    </div>
  );
};

export default FlashcardAIChat;
