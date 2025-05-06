
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';

interface WelcomeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
}

const Welcome = ({ open, onOpenChange, onDismiss }: WelcomeProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleDismiss = () => {
    onDismiss();
    toast({
      title: "Getting Started guide dismissed",
      description: "You can always access it again from the help menu"
    });
  };
  
  const handleGoToDashboard = () => {
    onDismiss();
    navigate('/dashboard');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-center">Welcome to Locnix.ai!</DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-6">
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
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="w-full sm:w-auto gap-2" onClick={handleGoToDashboard}>
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" onClick={handleDismiss} className="w-full sm:w-auto">
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Welcome;
