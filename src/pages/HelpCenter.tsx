
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Helmet } from 'react-helmet';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HelpCenter = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Help Center | Locnix.ai</title>
        <meta name="description" content="Get help and support for using Locnix.ai's AI-powered flashcard platform" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow pt-24 px-4">
        <div className="container mx-auto py-12">
          <h1 className="text-4xl font-display font-bold mb-8 text-center">Help Center</h1>
          
          <div className="max-w-3xl mx-auto mb-16">
            <p className="text-lg text-center text-gray-600 dark:text-gray-300">
              Find answers to common questions about using Locnix.ai. Can't find what you're looking for? 
              Contact us at <a href="mailto:dev.locnixai@gmail.com" className="text-primary">dev.locnixai@gmail.com</a>
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="mb-12">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">How do I create flashcards?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300">
                  <p>There are several ways to create flashcards on Locnix.ai:</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-2">
                    <li><strong>AI Generator:</strong> Upload a PDF document, paste text, or provide a topic, and our AI will automatically create relevant flashcards that test conceptual understanding.</li>
                    <li><strong>Manual Creation:</strong> Create custom flashcards by clicking the "Create New" button on your dashboard and filling in the front and back content.</li>
                    <li><strong>Import:</strong> Import existing flashcards from Anki, Quizlet, or CSV files by selecting "Import" from your dashboard.</li>
                    <li><strong>Collaborative Creation:</strong> Join a study group to collaborate on creating and sharing flashcards with classmates.</li>
                  </ol>
                  <p className="mt-2">Your created flashcards are immediately added to your library and scheduled according to our spaced repetition algorithm.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">How does the AI flashcard generator work?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300">
                  <p>Our AI flashcard generator uses advanced natural language processing to:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>Identify key concepts, definitions, and relationships in your learning material</li>
                    <li>Create question-answer pairs that promote active recall and critical thinking</li>
                    <li>Generate multiple question types (concept definition, application, comparison, etc.)</li>
                    <li>Adapt difficulty based on your learning level and subject matter</li>
                  </ul>
                  <p className="mt-2">Unlike other flashcard apps, our AI focuses on creating cards that test deeper understanding rather than mere memorization. You can edit any AI-generated cards or ask the AI to regenerate alternatives.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">What is spaced repetition and how does it work?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300">
                  <p>Spaced repetition is a scientifically-proven learning technique that optimizes long-term memory retention by scheduling reviews at strategic intervals.</p>
                  
                  <p className="mt-2"><strong>How our spaced repetition system works:</strong></p>
                  <ol className="list-decimal pl-5 mt-2 space-y-2">
                    <li>After studying a flashcard, you rate how well you knew the answer on a scale of 1-5</li>
                    <li>Cards you find difficult (rated 1-2) appear more frequently in your review sessions</li>
                    <li>Cards you know well (rated 4-5) appear less often but at increasing intervals</li>
                    <li>The algorithm continuously adapts to your performance, optimizing your study schedule</li>
                  </ol>
                  
                  <p className="mt-2">This approach ensures you spend more time on challenging material and less time reviewing what you already know well, maximizing learning efficiency.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">How do I use the study analytics dashboard?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300">
                  <p>Your study analytics dashboard provides valuable insights into your learning progress:</p>
                  
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>Performance Metrics:</strong> Track your retention rate, study streak, and time spent studying</li>
                    <li><strong>Knowledge Maps:</strong> Visualize your strengths and weaknesses across different subjects and topics</li>
                    <li><strong>Learning Curve:</strong> See how your recall improves over time for specific card sets</li>
                    <li><strong>Study Schedule:</strong> View upcoming review sessions and card load for optimal planning</li>
                    <li><strong>Mastery Score:</strong> Monitor your overall progress toward mastering each subject</li>
                  </ul>
                  
                  <p className="mt-2">Access your analytics by clicking the "Analytics" tab in your dashboard. You can filter data by time period, subject, or deck to gain targeted insights into your learning patterns.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">How do I customize my study settings?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300">
                  <p>Locnix.ai offers several ways to personalize your study experience:</p>
                  
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li><strong>Daily Card Limit:</strong> Set the maximum number of cards to review each day</li>
                    <li><strong>Study Session Duration:</strong> Define your preferred study session length (time or card count)</li>
                    <li><strong>Algorithm Intensity:</strong> Adjust how aggressively the spaced repetition algorithm schedules reviews</li>
                    <li><strong>Card Display:</strong> Customize how cards appear (font size, display options, etc.)</li>
                    <li><strong>Notification Preferences:</strong> Set reminders for daily study sessions and upcoming reviews</li>
                  </ul>
                  
                  <p className="mt-2">Access these settings by clicking on your profile icon in the top right corner and selecting "Study Settings" from the dropdown menu.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-medium">How do I join or create a study group?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300">
                  <p>Collaborative learning with study groups is easy on Locnix.ai:</p>
                  
                  <p className="mt-2"><strong>To create a new study group:</strong></p>
                  <ol className="list-decimal pl-5 mt-2 space-y-2">
                    <li>Navigate to the "Community" tab in your dashboard</li>
                    <li>Click "Create New Group" and enter a name, description, and subject area</li>
                    <li>Choose privacy settings (public, invite-only, or private)</li>
                    <li>Invite members by email or username</li>
                  </ol>
                  
                  <p className="mt-2"><strong>To join an existing group:</strong></p>
                  <ol className="list-decimal pl-5 mt-2 space-y-2">
                    <li>Browse public groups in the "Community" section</li>
                    <li>Request to join a group by clicking the "Join" button</li>
                    <li>Alternatively, accept an invitation sent to your email or notifications</li>
                  </ol>
                  
                  <p className="mt-2">Study group members can share flashcard decks, collaborate on creating new cards, and track group learning progress.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Still need help?</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">Our support team is ready to assist you with any questions or issues.</p>
              <a 
                href="mailto:dev.locnixai@gmail.com" 
                className="inline-block bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Contact Support
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
                  <a href="mailto:dev.locnixai@gmail.com" className="hover:text-primary transition-colors">
                    dev.locnixai@gmail.com
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

export default HelpCenter;
