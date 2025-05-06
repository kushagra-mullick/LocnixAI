
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WelcomeProps {
  onDismiss: () => void;
}

const Welcome = ({ onDismiss }: WelcomeProps) => {
  return (
    <Card className="border-primary/20 p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-display font-bold mb-2">Welcome to Locnix.ai!</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your AI-powered flashcard platform for smarter learning
        </p>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex gap-4 items-start">
          <div className="bg-primary/10 p-2 rounded-full">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Upload Your Study Material</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Upload PDFs or enter text from your course materials, textbooks, or notes
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 items-start">
          <div className="bg-primary/10 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 2a8 8 0 0 0-8 8 6 6 0 0 0 6 11 1 1 0 0 0 0-2 4 4 0 0 1-4-4 10 10 0 0 1 5-8.7V10a1 1 0 1 0 2 0V6.3A10 10 0 0 1 18 15a4 4 0 0 1-4 4 1 1 0 0 0 0 2 6 6 0 0 0 6-11 8 8 0 0 0-8-8z"></path>
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Generate AI Flashcards</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Our AI creates perfectly formatted flashcards with questions and answers based on your content
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 items-start">
          <div className="bg-primary/10 p-2 rounded-full">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Study with Spaced Repetition</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Review cards at optimal intervals to maximize retention and minimize study time
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/dashboard">
          <Button className="w-full sm:w-auto gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/tutorials">
          <Button variant="outline" className="w-full sm:w-auto">
            View Tutorials
          </Button>
        </Link>
        <Button variant="ghost" onClick={onDismiss} className="w-full sm:w-auto">
          Dismiss
        </Button>
      </div>
    </Card>
  );
};

export default Welcome;
