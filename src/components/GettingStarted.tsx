
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Brain, BookOpen, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const GettingStarted = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-display font-bold mb-6">Getting Started with Locnix.ai</h2>
      
      <div className="space-y-8">
        {/* Welcome Section */}
        <section className="glass-card p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Welcome to Locnix.ai
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Locnix.ai helps you create effective flashcards using AI technology. 
            Follow these simple steps to start your learning journey with us.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <StepCard 
              number={1} 
              title="Upload Content" 
              description="Upload PDFs or paste text to generate flashcards automatically"
              icon={<FileText className="h-5 w-5 text-primary" />}
            />
            <StepCard 
              number={2} 
              title="Generate Flashcards" 
              description="Our AI creates high-quality flashcards from your content"
              icon={<Brain className="h-5 w-5 text-primary" />}
            />
            <StepCard 
              number={3} 
              title="Study & Review" 
              description="Use spaced repetition to optimize your learning"
              icon={<Zap className="h-5 w-5 text-amber-500" />}
            />
          </div>
        </section>
        
        {/* Quick Start Guide */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Quick Start Guide</h3>
          
          <Card className="p-6 border-l-4 border-l-primary">
            <h4 className="text-lg font-medium mb-2">Upload Your First PDF</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Start by uploading a PDF document from your study materials. Our AI will extract the text and generate flashcards for you.
            </p>
            <Link to="/dashboard">
              <Button className="gap-2">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="p-6">
              <h4 className="text-lg font-medium mb-2">Try the Demo</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                See how Locnix.ai works by trying our demo with sample text. Generate flashcards instantly!
              </p>
              <Link to="/#generator-demo">
                <Button variant="outline" className="gap-2">
                  Try the Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
            
            <Card className="p-6">
              <h4 className="text-lg font-medium mb-2">Check Tutorials</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Learn more about all features with our comprehensive tutorials and guides.
              </p>
              <Link to="/tutorials">
                <Button variant="outline" className="gap-2">
                  View Tutorials <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>
        
        {/* Tips for Success */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Tips for Success</h3>
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg space-y-4">
            <TipItem 
              title="Upload Clear PDFs" 
              description="PDFs with clear text work best. Scanned documents may have varying results." 
            />
            <TipItem 
              title="Review AI-Generated Cards" 
              description="Our AI is smart, but reviewing and editing cards can make them even better for your learning style." 
            />
            <TipItem 
              title="Use Spaced Repetition" 
              description="Study regularly using our spaced repetition system for maximum retention." 
            />
            <TipItem 
              title="Join the Community" 
              description="Connect with other learners in our community for tips and shared resources." 
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const StepCard = ({ 
  number, 
  title, 
  description,
  icon 
}: { 
  number: number; 
  title: string; 
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
      <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center mb-2">
        {number}
      </div>
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

const TipItem = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
        </div>
      </div>
      <div>
        <h5 className="font-medium">{title}</h5>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
};

export default GettingStarted;
