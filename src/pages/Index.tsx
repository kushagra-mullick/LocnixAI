import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Sparkles } from 'lucide-react';
import { Rocket } from 'lucide-react';
import { GraduationCap } from 'lucide-react';
import { BarChart } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">
              Locnix.ai
            </Link>
            <div>
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/signin" className="mr-4">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            AI-Powered Flashcards for Smarter Learning
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
            Unlock your learning potential with AI-generated flashcards and personalized study plans.
          </p>
          <Button size="lg" asChild>
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              {isAuthenticated ? "Go to Dashboard" : "Get Started - Create Account"}
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="AI-Generated Flashcards"
              description="Automatically create flashcards from your notes and study materials."
              icon={Sparkles}
            />
            <FeatureCard
              title="Spaced Repetition"
              description="Optimize your study schedule for maximum retention."
              icon={Rocket}
            />
            <FeatureCard
              title="Personalized Learning"
              description="Tailor your study experience to your individual needs."
              icon={GraduationCap}
            />
            <FeatureCard
              title="Performance Analytics"
              description="Track your progress and identify areas for improvement."
              icon={BarChart}
            />
            <FeatureCard
              title="AI Flashcard Chat"
              description="Chat with AI to get help with your flashcards."
              icon={MessageSquare}
            />
            <FeatureCard
              title="Secure and Private"
              description="Your data is safe and secure with us."
              icon={ShieldCheck}
            />
          </div>
        </div>
      </section>

      <footer className="py-6 md:py-8 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Locnix.ai. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
      <Icon className="h-6 w-6 text-primary mb-4" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default Index;
