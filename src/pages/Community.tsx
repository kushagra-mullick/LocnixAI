
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Helmet } from 'react-helmet';
import { Users, MessageCircle, Award, Calendar, Mail, Twitter, MessageSquare } from 'lucide-react';

const Community = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Community | Locnix.ai</title>
        <meta name="description" content="Join the Locnix.ai learning community and connect with other students and educators" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow pt-24 px-4">
        <div className="container mx-auto py-12">
          <h1 className="text-4xl font-display font-bold mb-8 text-center">Locnix.ai Community</h1>
          
          <div className="max-w-3xl mx-auto mb-16">
            <p className="text-lg text-center text-gray-600 dark:text-gray-300">
              Connect with other learners, share study resources, and participate in events.
              Our community is here to support your learning journey.
            </p>
          </div>
          
          {/* Community Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <FeatureCard icon={<Users className="w-10 h-10 text-primary" />} title="Study Groups" description="Join or create study groups based on subjects, courses, or interests. Collaborate with peers to enhance your learning experience." />
            <FeatureCard icon={<MessageCircle className="w-10 h-10 text-primary" />} title="Discussion Forums" description="Engage in thoughtful discussions, ask questions, and share insights with our global community of learners." />
            <FeatureCard icon={<Award className="w-10 h-10 text-primary" />} title="Challenges & Competitions" description="Test your knowledge and compete with others in friendly learning challenges and competitions." />
            <FeatureCard icon={<Calendar className="w-10 h-10 text-primary" />} title="Events & Webinars" description="Attend virtual events, workshops, and webinars led by experts and fellow community members." />
          </div>
          
          {/* Join Community CTA */}
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-4">Ready to Join Our Community?</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Create an account today to access all our community features and connect with fellow learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup" className="inline-block bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
                Join Now
              </a>
              <a href="mailto:dev.locnixai@gmail.com" className="inline-block bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
                Contact Us
              </a>
            </div>
            <div className="flex justify-center mt-6 gap-4">
              <a href="https://discord.gg/NDX2XnHsaM" target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                <MessageSquare className="w-6 h-6" />
              </a>
              <a href="https://x.com/locnixai" target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                <Twitter className="w-6 h-6" />
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

const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="glass-card p-6 flex flex-col">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default Community;
