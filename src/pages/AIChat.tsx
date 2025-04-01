
import React from 'react';
import Navbar from '@/components/Navbar';
import FlashcardAIChat from '@/components/FlashcardAIChat';
import { Card, CardContent } from '@/components/ui/card';
import { useFlashcards } from '@/context/FlashcardContext';
import { Brain, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AIChat = () => {
  const { flashcards, isLoading } = useFlashcards();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">AI Flashcard Assistant</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Ask questions about your flashcards and get personalized study assistance
              </p>
            </div>
            
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <span className="font-medium">{isLoading ? "Loading..." : `${flashcards.length} Flashcards Available`}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-lg border border-gray-200 dark:border-gray-800">
                <CardContent className="p-0">
                  <FlashcardAIChat />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>AI Assistant Tips</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Ask for explanations of difficult concepts</li>
                    <li>Get study recommendations based on your flashcards</li>
                    <li>Request quiz questions from your flashcard content</li>
                    <li>Find connections between different flashcard topics</li>
                    <li>Get help creating new flashcards from existing ones</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Sample Questions
                </h3>
                <div className="space-y-2">
                  {[
                    "What are the main topics in my flashcard collection?",
                    "Quiz me on my biology flashcards",
                    "Help me understand the concept of [topic from flashcards]",
                    "What should I study next based on my flashcards?",
                    "Create a summary of what I've been learning"
                  ].map((question, i) => (
                    <div 
                      key={i}
                      className="text-sm p-2 rounded bg-white dark:bg-gray-800 cursor-pointer hover:bg-primary/5 transition-colors"
                      onClick={() => {
                        // You could implement functionality to auto-fill these questions
                        console.log('Sample question clicked:', question);
                      }}
                    >
                      {question}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIChat;
