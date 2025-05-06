
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import FlashcardGenerator from '@/components/FlashcardGenerator';
import GettingStarted from '@/components/GettingStarted';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, LightbulbIcon, Twitter, MessageSquare, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Welcome from '@/components/Welcome';
import { useWelcomeGuide } from '@/hooks/useWelcomeGuide';

const Index = () => {
  const { toast } = useToast();
  const { showWelcomeGuide, setShowWelcomeGuide, dismissWelcomeGuide } = useWelcomeGuide();
  
  const handleDemoRequest = () => {
    toast({
      title: "Demo Requested",
      description: "Thank you for your interest! Our team will contact you soon."
    });
  };
  
  const handleShowGuide = () => {
    setShowWelcomeGuide(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Welcome Guide Dialog */}
      <Welcome 
        open={showWelcomeGuide} 
        onOpenChange={setShowWelcomeGuide} 
        onDismiss={dismissWelcomeGuide}
      />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />
        
        {/* Getting Started Button */}
        <div className="text-center py-4">
          <Button 
            onClick={handleShowGuide}
            className="mx-auto flex items-center gap-2"
            variant="outline"
          >
            <LightbulbIcon className="w-4 h-4" />
            Show Getting Started Guide
          </Button>
        </div>
        
        {/* Getting Started Section for new users */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900" id="getting-started">
          <div className="container mx-auto">
            <GettingStarted />
          </div>
        </section>
        
        {/* Features Section */}
        <Features />
        
        {/* Generator Demo Section */}
        <section className="py-24 px-4 relative overflow-hidden" id="generator-demo">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-primary/10 filter blur-3xl opacity-60"></div>
            <div className="absolute right-1/3 bottom-1/3 h-72 w-72 rounded-full bg-accent/10 filter blur-3xl opacity-60"></div>
          </div>
          
          <div className="container mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Try Our AI Flashcard Generator
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Experience the power of our AI firsthand. Paste in any text and watch as our system transforms it into effective flashcards.
            </p>
            
            <FlashcardGenerator />
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Loved by Students & Educators</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Join hundreds of students and educators who are already experiencing the benefits of AI-powered learning.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Testimonial quote="Locnix.ai helped me ace my medical exams. The AI created better flashcards than I could have made myself in a fraction of the time." author="Sarah J." role="Medical Student" />
              <Testimonial quote="As a teacher, I can quickly generate customized flashcards for my students. The time savings alone are worth it, but the quality is amazing too." author="Mark T." role="High School Teacher" />
              <Testimonial quote="I've tried many flashcard apps, but the AI in Locnix.ai actually understands the material and creates cards that test true comprehension." author="Alex K." role="Language Learner" />
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-80"></div>
          </div>
          
          <div className="container mx-auto text-center">
            <div className="glass-panel max-w-3xl mx-auto rounded-2xl p-12">
              <LightbulbIcon className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">Join hundreds of students who are already studying smarter, not harder, with Locnix.ai.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Locnix.ai</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link to="/about-us" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link to="/help-center" className="hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/tutorials" className="hover:text-primary transition-colors">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link to="/community" className="hover:text-primary transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className="hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="mailto:dev.locnixai@gmail.com" className="hover:text-primary transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" /> dev.locnixai@gmail.com
                  </a>
                </li>
                <li>
                  <a href="https://discord.gg/NDX2XnHsaM" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Discord Server
                  </a>
                </li>
                <li>
                  <a href="https://x.com/locnixai" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                    <Twitter className="w-4 h-4" /> @locnixai
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Locnix.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const Testimonial = ({
  quote,
  author,
  role
}: {
  quote: string;
  author: string;
  role: string;
}) => {
  return <div className="glass-card p-6 md:p-8 flex flex-col">
      <div className="mb-4 text-primary">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3333 23.3333C13.3333 25.1743 11.8409 26.6667 10 26.6667C8.15906 26.6667 6.66667 25.1743 6.66667 23.3333C6.66667 21.4924 8.15906 20 10 20C11.8409 20 13.3333 21.4924 13.3333 23.3333Z" fill="currentColor" />
          <path d="M33.3333 23.3333C33.3333 25.1743 31.8409 26.6667 30 26.6667C28.1591 26.6667 26.6667 25.1743 26.6667 23.3333C26.6667 21.4924 28.1591 20 30 20C31.8409 20 33.3333 21.4924 33.3333 23.3333Z" fill="currentColor" />
          <path fillRule="evenodd" clipRule="evenodd" d="M10 16.6667C6.31811 16.6667 3.33334 19.6515 3.33334 23.3333C3.33334 27.0152 6.31811 30 10 30C12.7614 30 15.1122 28.2881 16.1741 25.8499C16.3711 25.4376 16.5329 25.0073 16.6563 24.5622C16.8743 23.7422 16.9919 22.8776 16.9992 21.9932L17 21.9933C17 21.975 17 21.9566 17 21.9383V13.3333C17 12.4129 16.2538 11.6667 15.3333 11.6667H4.66667C3.74619 11.6667 3 12.4129 3 13.3333V18.3333C3 19.2538 3.74619 20 4.66667 20H6.59001C6.81655 18.9616 7.25938 18.0039 7.86358 17.1748C8.46466 16.3496 9.17173 16.6667 10 16.6667ZM30 16.6667C26.3181 16.6667 23.3333 19.6515 23.3333 23.3333C23.3333 27.0152 26.3181 30 30 30C32.7614 30 35.1122 28.2881 36.1741 25.8499C36.3711 25.4376 36.5329 25.0073 36.6563 24.5622C36.8743 23.7422 36.9919 22.8776 36.9992 21.9932L37 21.9933C37 21.975 37 21.9566 37 21.9383V13.3333C37 12.4129 36.2538 11.6667 35.3333 11.6667H24.6667C23.7462 11.6667 23 12.4129 23 13.3333V18.3333C23 19.2538 23.7462 20 24.6667 20H26.59C26.8166 18.9616 27.2594 18.0039 27.8636 17.1748C28.4647 16.3496 29.1717 16.6667 30 16.6667Z" fill="currentColor" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-300 italic mb-6">{quote}</p>
      <div className="mt-auto">
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>;
};

export default Index;
