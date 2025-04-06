
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Get location state to handle redirects after login
  const from = location.state?.from || '/';

  React.useEffect(() => {
    // If already authenticated, redirect to the originally requested page or dashboard
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="mb-6">Welcome to your dashboard!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Start Studying</h2>
            <p className="text-muted-foreground mb-4">
              Review your flashcards and improve your knowledge retention.
            </p>
            <Button onClick={() => navigate('/study')}>
              Start Study Session
            </Button>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create Flashcards</h2>
            <p className="text-muted-foreground mb-4">
              Create new flashcards to add to your study materials.
            </p>
            <Button variant="outline">
              Create Flashcards
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
