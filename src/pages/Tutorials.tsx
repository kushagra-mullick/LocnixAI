
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Helmet } from 'react-helmet';
import { PlayCircle, FileText, BookOpen, Lightbulb, LineChart, Users, Mail, Twitter, MessageSquare } from 'lucide-react';

const Tutorials = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Tutorials | Locnix.ai</title>
        <meta name="description" content="Learn how to use Locnix.ai with our comprehensive tutorials" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow pt-24 px-4">
        <div className="container mx-auto py-12">
          <h1 className="text-4xl font-display font-bold mb-8 text-center">Tutorials</h1>
          
          <div className="max-w-3xl mx-auto mb-16">
            <p className="text-lg text-center text-gray-600 dark:text-gray-300">
              Master Locnix.ai with our comprehensive tutorials. From basic setup to advanced features,
              we'll help you get the most out of your AI-powered learning experience.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TutorialCard 
                title="Creating Your First Flashcards" 
                description="Learn how to set up your account, navigate the dashboard, and create your first set of AI-generated flashcards from any study material."
                type="video"
                estimatedTime="5 min"
                icon={<PlayCircle className="w-6 h-6 text-primary" />}
              />
              <TutorialCard 
                title="Uploading and Converting PDFs" 
                description="See how to upload textbooks, lecture notes, or any PDF document and convert them into highly effective flashcards automatically."
                type="video"
                estimatedTime="4 min"
                icon={<PlayCircle className="w-6 h-6 text-primary" />}
              />
              <TutorialCard 
                title="Your First Study Session" 
                description="Learn how to start studying with your flashcards, understand the spaced repetition system, and track your initial progress."
                type="article"
                estimatedTime="7 min"
                icon={<FileText className="w-6 h-6 text-primary" />}
              />
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">AI Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TutorialCard 
                title="Mastering AI Flashcard Generation" 
                description="Learn advanced techniques for creating perfect flashcards using our AI generator with different types of content and subject matters."
                type="guide"
                estimatedTime="10 min"
                icon={<Lightbulb className="w-6 h-6 text-primary" />}
              />
              <TutorialCard 
                title="Customizing AI-Generated Cards" 
                description="Discover how to edit, refine, and customize AI-generated flashcards to match your learning style and specific needs."
                type="video"
                estimatedTime="6 min"
                icon={<PlayCircle className="w-6 h-6 text-primary" />}
              />
              <TutorialCard 
                title="Using AI for Complex Subjects" 
                description="Special techniques for using the AI generator with technical, scientific, or mathematical content for optimal learning results."
                type="article"
                estimatedTime="8 min"
                icon={<FileText className="w-6 h-6 text-primary" />}
              />
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">Advanced Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TutorialCard 
                title="Optimizing Your Study Schedule" 
                description="Learn how to set up and customize your study schedule for maximum retention and efficiency using our adaptive algorithm."
                type="guide"
                estimatedTime="9 min"
                icon={<BookOpen className="w-6 h-6 text-primary" />}
              />
              <TutorialCard 
                title="Using Analytics to Improve" 
                description="Understand how to interpret and use your performance data to identify weak areas and continuously improve your learning outcomes."
                type="article"
                estimatedTime="7 min"
                icon={<LineChart className="w-6 h-6 text-primary" />}
              />
              <TutorialCard 
                title="Collaborative Learning Features" 
                description="Learn how to create study groups, share and collaborate on flashcard decks, and participate in the Locnix.ai learning community."
                type="video"
                estimatedTime="8 min"
                icon={<Users className="w-6 h-6 text-primary" />}
              />
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold mb-4">Can't find what you need?</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Check our <Link to="/help-center" className="text-primary hover:underline">Help Center</Link> or 
              contact us at <a href="mailto:dev.locnixai@gmail.com" className="text-primary hover:underline">dev.locnixai@gmail.com</a>
            </p>
            <div className="flex justify-center gap-4">
              <a href="https://discord.gg/NDX2XnHsaM" target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                <MessageSquare className="w-6 h-6" />
              </a>
              <a href="https://x.com/locnixai" target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="mailto:dev.locnixai@gmail.com" className="text-primary hover:text-primary/80 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
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

const TutorialCard = ({ 
  title, 
  description, 
  type, 
  estimatedTime,
  icon
}: { 
  title: string; 
  description: string; 
  type: 'video' | 'article' | 'guide'; 
  estimatedTime: string;
  icon?: React.ReactNode;
}) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'video':
        return <PlayCircle className="w-6 h-6 text-primary" />;
      case 'article':
        return <FileText className="w-6 h-6 text-primary" />;
      case 'guide':
        return <BookOpen className="w-6 h-6 text-primary" />;
      default:
        return <FileText className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="glass-card p-6 hover:shadow-md transition-shadow rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center mb-4">
        {getIcon()}
        <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{type}</span>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{estimatedTime}</span>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      <button className="text-primary hover:underline mt-auto flex items-center gap-1">
        View Tutorial
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Tutorials;
