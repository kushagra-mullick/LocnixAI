import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BookOpenCheck, GraduationCap, HelpCircle, Lightbulb, LightbulbIcon, Search, Settings, User2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Welcome from '@/components/Welcome';
import { useWelcomeGuide } from '@/hooks/useWelcomeGuide';

const Dashboard = () => {
  const { showWelcomeGuide, setShowWelcomeGuide, dismissWelcomeGuide, resetWelcomeGuide } = useWelcomeGuide();
  const { toast } = useToast();
  
  const handleShowWelcomeGuide = () => {
    setShowWelcomeGuide(true);
    toast({
      title: "Welcome Guide",
      description: "Showing the getting started guide"
    });
  };

  return (
    <div>
      {/* Welcome guide popup */}
      <Welcome 
        open={showWelcomeGuide} 
        onOpenChange={setShowWelcomeGuide} 
        onDismiss={dismissWelcomeGuide} 
      />
      
      {/* Help button to reopen the welcome guide */}
      <div className="fixed bottom-4 right-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShowWelcomeGuide}
          className="flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 17V16.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 14.5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Help
        </Button>
      </div>
      
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions Section */}
          <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <CardDescription>Get started quickly with these common tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="secondary" className="w-full justify-start gap-2">
                <LightbulbIcon className="h-4 w-4" /> Generate Flashcards
              </Button>
              <Button variant="secondary" className="w-full justify-start gap-2">
                <BookOpenCheck className="h-4 w-4" /> Start Studying
              </Button>
              <Button variant="secondary" className="w-full justify-start gap-2">
                <GraduationCap className="h-4 w-4" /> Review Performance
              </Button>
            </CardContent>
          </Card>

          {/* Study Resources Section */}
          <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Study Resources</CardTitle>
              <CardDescription>Access your flashcards and study materials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="secondary" className="w-full justify-start gap-2">
                <Search className="h-4 w-4" /> Browse Flashcards
              </Button>
              <Button variant="secondary" className="w-full justify-start gap-2">
                <File className="h-4 w-4" /> Upload New Material
              </Button>
            </CardContent>
          </Card>

          {/* Account Management Section */}
          <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Account Management</CardTitle>
              <CardDescription>Manage your profile and settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="secondary" className="w-full justify-start gap-2">
                <User2 className="h-4 w-4" /> Edit Profile
              </Button>
              <Button variant="secondary" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" /> Account Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I generate flashcards?</AccordionTrigger>
              <AccordionContent>
                To generate flashcards, upload a PDF or paste text into the generator tool. Our AI will automatically create flashcards for you.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I study on my mobile device?</AccordionTrigger>
              <AccordionContent>
                Yes, Locnix.ai is fully responsive and works on all devices.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How does spaced repetition work?</AccordionTrigger>
              <AccordionContent>
                Spaced repetition is an algorithm that schedules flashcards based on your performance, optimizing review intervals for better retention.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

const File = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M14.5 2H6A2 2 0 0 0 4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <path d="M10 9H8" />
  </svg>
);
